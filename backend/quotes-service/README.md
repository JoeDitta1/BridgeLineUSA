# quotes-service/quotes-service/README.md

# Quotes Service

This project is a Quotes Service that manages quotes and their associated Bill of Materials (BOM). It is built using Node.js and Express, and it interacts with a database to store and retrieve quote information.

## Project Structure

```
quotes-service
├── backend
│   ├── db.js                # Handles the database connection and exports the database instance
│   ├── server.js            # Entry point of the application; sets up the server and routes
│   ├── routes               # Contains route definitions
│   │   ├── index.js         # Main routes setup
│   │   └── quotesBomRoutes.js # Handles BOM acceptance for quotes
│   ├── controllers          # Contains business logic for quotes
│   │   └── quotesController.js # Functions for quote-related operations
│   ├── models               # Defines data models
│   │   └── quoteBom.js      # Schema and methods for quote BOM data
│   └── middleware           # Middleware functions
│       └── errorHandler.js  # Error handling middleware
├── tests                    # Contains unit tests
│   └── quotesBom.test.js    # Tests for quotesBomRoutes.js
├── .env                     # Environment variables
├── .gitignore               # Files and directories to ignore by Git
├── package.json             # npm configuration file
├── nodemon.json             # Configuration for nodemon
└── README.md                # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd quotes-service
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your environment variables in the `.env` file.

## Usage

To start the server, run:
```
npm start
```

For development, you can use:
```
npm run dev
```

This will start the server with nodemon, which automatically restarts the server on file changes.

## API Endpoints

- **POST /api/quotes/:id/bom/accept**: Accepts a Bill of Materials for a specific quote.

## Testing

To run the tests, use:
```
npm test
```

## Contributing

Feel free to submit issues or pull requests for any improvements or bug fixes.