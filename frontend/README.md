# De Anza Tree Map Frontend

Modern React frontend for the De Anza Tree Map application built with React, Tailwind CSS, and Leaflet.

## Features

- Interactive map with tree locations using Leaflet
- Cluster visualization for tree groups
- Dynamic zoom levels showing different views of campus areas
- Filtering by tree name, tag number, and height
- Detailed tree information popups
- Responsive design with Tailwind CSS

## Tech Stack

- **React**: UI framework
- **React Router**: Page routing
- **Tailwind CSS**: Styling
- **Leaflet**: Map library
- **React Leaflet**: React components for Leaflet
- **Leaflet.markercluster**: Clustering plugin
- **Axios**: API requests
- **Vite**: Build tool

## Getting Started

### Prerequisites

- Node.js (version 16 or above)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/DATreeMap.git
   cd DATreeMap/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) to view the app in your browser.

### Building for Production

```bash
npm run build
# or
yarn build
```

The build output will be in the `dist` folder.

## Project Structure

```
frontend/
├── public/            # Public assets
├── src/
│   ├── components/    # React components
│   ├── services/      # API services
│   ├── hooks/         # Custom React hooks
│   ├── App.jsx        # Main app component
│   ├── config.js      # Application configuration
│   ├── index.css      # Global styles
│   └── main.jsx       # Entry point
├── index.html         # HTML template
├── vite.config.js     # Vite configuration
├── tailwind.config.js # Tailwind configuration
└── package.json       # Dependencies and scripts
```

## Integration with Backend

This frontend is designed to work with the Django backend API. The Vite development server is configured to proxy API requests to the Django backend running on port 8000. Make sure the Django server is running before starting the frontend development server.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 