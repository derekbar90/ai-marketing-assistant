import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PGlite } from "@electric-sql/pglite";
import { live } from "@electric-sql/pglite/live";
import { PGliteProvider } from "@electric-sql/pglite-react";
import App from "./App";
import { vector } from "@electric-sql/pglite/vector";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

// Create the PGlite instance
PGlite.create({
  extensions: { live, vector },
  storage: 'idb://hypelab-db'
}).then(db => {
  root.render(
    <StrictMode>
      <PGliteProvider db={db}>
        <App />
      </PGliteProvider>
    </StrictMode>
  );
});
