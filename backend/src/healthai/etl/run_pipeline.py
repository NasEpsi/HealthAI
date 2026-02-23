from healthai.etl.run_all import main as run_ingest
from healthai.etl.export_data import main as run_export

def main():
    run_ingest()
    run_export()

if __name__ == "__main__":
    main()