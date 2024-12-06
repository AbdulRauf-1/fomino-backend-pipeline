<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Path to your working directory
$workingDir = '/home/fomino/testingtsh.fomino.ch';

// Ensure the PATH environment variable includes the required directories
$path = getenv('PATH') . ':/home/fomino/.nvm/versions/node/v16.20.2/bin'; // Add npm's location if needed
putenv("PATH=$path");

// Check environment variables
echo "<h3>Environment Variables:</h3>";
echo "<pre>";
print_r($_SERVER); // This will include PATH and other server variables
echo "</pre>";

// Change to the working directory
chdir($workingDir);

// Run the npm install command
$command = "npm install 2>&1"; // Using npm directly
$output = [];
$returnVar = 0;

// Execute the command and capture output
shell_exec($command, $output, $returnVar);

// Display the command and its output
echo "<h3>Command:</h3>";
echo "<pre>$command</pre>";

echo "<h3>Output:</h3>";
echo "<pre>";
echo implode("\n", $output);
echo "</pre>";

echo "<h3>Return Code:</h3>";
echo "<pre>$returnVar</pre>";

// Debugging: Check if npm is accessible
echo "<h3>NPM Version:</h3>";
$npmVersion = [];
exec("npm -v", $npmVersion);
echo "<pre>" . implode("\n", $npmVersion) . "</pre>";
?>
