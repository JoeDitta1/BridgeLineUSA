# quote-ai-service/quote-ai-service/README.md
# Quote AI Service

This project is a backend service for managing quotes and their associated attachments. It provides functionality to retrieve quote attachments with signed URLs and formats the output for easy consumption.

## Project Structure

- **backend/**
  - **services/**
    - **ai/**
      - `prepareDocs.js`: Contains the function to load text for a quote by retrieving its attachments.
    - **files/**
      - `attachmentsQuery.js`: Contains the function to get quote attachments with signed URLs.
  - **controllers/**
    - `quotesController.js`: Handles requests related to quotes.
  - **routes/**
    - `quotes.js`: Defines the routes for quote-related operations.
  - `index.js`: Entry point for the backend application.

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd quote-ai-service
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

To start the server, run:
```
npm start
```

## Environment Variables

An example of the required environment variables can be found in the `.env.example` file. Make sure to create a `.env` file in the root directory and populate it with the necessary variables.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.