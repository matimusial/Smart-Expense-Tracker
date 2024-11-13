import os
import itertools
import concurrent.futures
from collections import defaultdict

from cnnTrimChecker.cnn_service.cnn_predict import load_cnn_model
from config import CNN_FIND_SEQUENCE_MODEL_NAME
from services.receipt_trimmer import load_image, trim_receipt

cnn_model = None


def initialize_cnn_model():
    global cnn_model
    cnn_model = load_cnn_model(CNN_FIND_SEQUENCE_MODEL_NAME)


def process_image(filename, input_path, parameter_combinations):
    file_path = os.path.join(input_path, filename)

    try:
        image = load_image(file_path)
    except FileNotFoundError:
        return []

    positive_combinations = []

    for combination in parameter_combinations:
        blur_kernel_size = combination[0]
        morph_kernel_size = combination[1]
        morph_iterations = combination[2]
        epsilon_factor = combination[3]
        dilation_iterations = combination[4]
        erosion_iterations = combination[5]

        result, _ = trim_receipt(
            image,
            cnn_model,
            blur_kernel_size,
            morph_kernel_size,
            morph_iterations,
            epsilon_factor,
            dilation_iterations,
            erosion_iterations
        )

        if result == 'positive':
            positive_combinations.append(combination)

    return positive_combinations


def create_sequences(sorted_combinations, combination_success_images, total_images_set, sequence_file_template, max_combinations=100):
    top_3_combinations = [combo for combo, count in sorted_combinations[:1]]

    for idx, initial_combination in enumerate(top_3_combinations, start=1):
        covered_images = set()
        selected_combinations = []
        remaining_combinations = combination_success_images.copy()

        if initial_combination in remaining_combinations:
            selected_combinations.append(initial_combination)
            covered_images.update(remaining_combinations[initial_combination])
            del remaining_combinations[initial_combination]
        else:
            print(f"Kombinacja początkowa {initial_combination} nie została znaleziona w wynikach.")
            continue

        while len(covered_images) < len(total_images_set) and len(selected_combinations) < max_combinations:
            best_combo = None
            max_new_coverage = 0

            for combo, images in remaining_combinations.items():
                new_coverage = len(images - covered_images)
                if new_coverage > max_new_coverage:
                    max_new_coverage = new_coverage
                    best_combo = combo

            if best_combo is None:
                break

            selected_combinations.append(best_combo)
            covered_images.update(remaining_combinations[best_combo])
            del remaining_combinations[best_combo]

        sequence_file = sequence_file_template.format(idx)
        with open(sequence_file, 'w', encoding='utf-8') as f:
            f.write(f"Sekwencja {idx} dla początkowej kombinacji: {initial_combination}\n\n")
            f.write("Wybrana sekwencja kombinacji:\n\n")
            for i, combo in enumerate(selected_combinations, start=1):
                f.write(f"{i}. Kombinacja: {combo}\n")
            f.write(f"\nŁącznie pokrytych obrazów: {len(covered_images)} z {len(total_images_set)}\n")
            f.write(f"Liczba użytych kombinacji: {len(selected_combinations)}\n")

        print(f"Sekwencja {idx} zapisana w: {sequence_file}")
        print(f"Łączny wynik (pokryte obrazy): {len(covered_images)}")
        print(f"Liczba użytych kombinacji: {len(selected_combinations)}\n")


def main():
    input_path = r'C:\Users\matim\Desktop\wqe'
    output_path = r'C:\Users\matim\Desktop\wqe'
    ranking_file = os.path.join(output_path, f'{CNN_FIND_SEQUENCE_MODEL_NAME}_combination_ranking.txt')
    sequence_file_template = os.path.join(output_path, f'{CNN_FIND_SEQUENCE_MODEL_NAME}_combination_sequence.txt')

    if not os.path.exists(output_path):
        os.makedirs(output_path)

    blur_kernel_sizes = [(3, 3)]
    morph_kernel_sizes = [(3, 3)]
    morph_iterations_list = [1, 2, 3]
    epsilon_factors = [0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09]
    dilation_iterations_list = [0, 1, 2]
    erosion_iterations_list = [0, 1, 2]

    parameter_combinations = list(itertools.product(
        blur_kernel_sizes,
        morph_kernel_sizes,
        morph_iterations_list,
        epsilon_factors,
        dilation_iterations_list,
        erosion_iterations_list
    ))

    combination_success_counts = defaultdict(int)
    combination_success_images = defaultdict(set)

    image_filenames = [f for f in os.listdir(input_path) if f.endswith('.jpg')]

    total_images = len(image_filenames)
    print(f"Rozpoczęcie przetwarzania {total_images} obrazów.")

    max_workers = os.cpu_count()
    print(f"Liczba dostępnych rdzeni CPU: {max_workers}")

    images_with_no_positive = 0

    with concurrent.futures.ProcessPoolExecutor(max_workers=max_workers, initializer=initialize_cnn_model) as executor:
        futures_to_filenames = {
            executor.submit(process_image, filename, input_path, parameter_combinations): filename
            for filename in image_filenames
        }

        processed_count = 0

        for future in concurrent.futures.as_completed(futures_to_filenames):
            filename = futures_to_filenames[future]
            try:
                positive_combinations = future.result()

                if len(positive_combinations) == 0:
                    images_with_no_positive += 1

                for combo in positive_combinations:
                    combination_success_counts[combo] += 1
                    combination_success_images[combo].add(filename)

                processed_count += 1

                print(f"Przetworzono obraz: {filename} ({processed_count}/{total_images}) | Kombinacje pozytywne: {len(positive_combinations)}")
            except Exception as e:
                processed_count += 1
                print(f"Błąd podczas przetwarzania obrazu {filename}: {str(e)} ({processed_count}/{total_images})")

    sorted_combinations = sorted(combination_success_counts.items(), key=lambda x: x[1], reverse=True)

    with open(ranking_file, 'w', encoding='utf-8') as f:
        f.write(f"Ilość plików dla których żadna kombinacja nie dała wyniku pozytywnego: {images_with_no_positive}\n\n")
        f.write("Ranking kombinacji:\n")
        for combo, count in sorted_combinations:
            f.write(f"Kombinacja: {combo}, Sukcesy: {count}\n")

    print("Przetwarzanie zakończone.")
    print(f"Ranking kombinacji zapisano w: {ranking_file}")

    total_images_set = set(image_filenames)
    create_sequences(
        sorted_combinations,
        combination_success_images,
        total_images_set,
        sequence_file_template)

if __name__ == "__main__":
    main()