from healthai.etl.nutrition_ingest import run_nutrition_ingest
from healthai.etl.fitness_ingest import run_fitness_ingest

def main() -> None:
    run_nutrition_ingest()
    run_fitness_ingest()

if __name__ == "__main__":
    main()