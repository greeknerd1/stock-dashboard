import os
import psycopg2
import csv

# Database connection details
conn = psycopg2.connect(
    dbname="stock_dashboard",
    user="admin",
    password="password",
    host="localhost",
    port="5432"
)

cur = conn.cursor()

# Path to the CSV directory
csv_directory = os.path.expanduser('~/Documents/stock_dashboard/misc/Yahoo_Finance_Stock_Data')

# List of files
csv_files = [
    "MSFT.csv",
    "GOOGL.csv",
    "AMZN.csv",
    "NVDA.csv",
    "TSLA.csv",
    "BRK-B.csv",
    "META.csv",
    "UNH.csv",
    "XOM.csv",
    "AAPL.csv"
]

for csv_file in csv_files:
    ticker_symbol = csv_file.split('.')[0]
    with open(os.path.join(csv_directory, csv_file), 'r') as f:
        reader = csv.reader(f)
        next(reader)  # Skip the header row
        for row in reader:
            cur.execute("""
                INSERT INTO stocks (ticker_symbol, date, open_price, high_price, low_price, close_price, adj_close_price, volume)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (ticker_symbol, row[0], row[1], row[2], row[3], row[4], row[5], row[6]))

conn.commit()
cur.close()
conn.close()
