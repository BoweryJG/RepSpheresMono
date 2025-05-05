#!/bin/bash

# Script to run the initial data loader

echo "Starting data loader script..."

# Run the data loader with Node.js
node --experimental-modules --es-module-specifier-resolution=node src/services/supabase/initialDataLoader.js

echo "Data loader script completed."
