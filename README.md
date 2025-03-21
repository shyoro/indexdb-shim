# IndexedDB Shim

A **simple** and **lightweight** IndexedDB wrapper that provides an asynchronous API similar to `localStorage`. This package is designed to offer a straightforward solution for storing key-value pairs in the browser using IndexedDB, with minimal dependencies and a modern TypeScript codebase.

## Features

- **Simplicity:** Familiar `localStorage`-like API (`setItem`, `getItem`, `removeItem`, `clear`)
- **Asynchronous:** Leverages `async/await` for non-blocking database operations
- **Lightweight:** Minimal overhead and dependencies, perfect for high-performance web apps
- **Browser-native:** Uses the native IndexedDB API under the hood

## Installation

Install the package via npm:

```sh
npm install indexdb-shim
```
## Usage

```javascript
import AsyncStorage from 'indexdb-shim';

(async () => {
  // Create a new instance of AsyncStorage
  const storage = new AsyncStorage();

  // Store a key-value pair
  await storage.setItem('username', 'Alice');

  // Retrieve a value
  const username = await storage.getItem('username');
  console.log(username); // "Alice"

  // Remove a key-value pair
  await storage.removeItem('username');

  // Clear all stored data
  await storage.clear();
})();

```

## Development

### Build
To compile the TypeScript source code, run:
```sh
npm run build
```

## Testing
Tests are written using Node.js’s native testing module along with `fake-indexeddb` to simulate browser APIs.

Run tests with:
```sh
npm test
```

## Contributing
Contributions, suggestions, and improvements are welcome! Please open an issue or submit a pull request on GitHub.

## License
This project is licensed under the Apache-2.0 License.