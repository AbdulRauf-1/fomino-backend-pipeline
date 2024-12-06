<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Path to your working directory
$workingDir = '/home/fomino/testingtsh.fomino.ch';

// Full path to node and npm binaries
$nodePath = '/home/fomino/.nvm/versions/node/v16.20.2/bin/node';
$npmPath = '/home/fomino/.nvm/versions/node/v16.20.2/bin/npm';

// Ensure the PATH environment variable includes the required directories
$path = getenv('PATH') . ':/home/fomino/.nvm/versions/node/v16.20.2/bin';
putenv("PATH=$path");

// Check environment variables
echo "<h3>Environment Variables:</h3>";
echo "<pre>";
print_r($_SERVER); // This will include PATH and other server variables
echo "</pre>";

// Change to the working directory
chdir($workingDir);

// Run the npm install command
$command = "npm install 2>&1";
$output = [];
$returnVar = 0;

// Execute the command and capture output
exec($command, $output, $returnVar);

// Display the command and its output
echo "<h3>Command:</h3>";
echo "<pre>$command</pre>";

echo "<h3>Output:</h3>";
echo "<pre>";
echo implode("\n", $output);
echo "</pre>";

echo "<h3>Return Code:</h3>";
echo "<pre>$returnVar</pre>";

// Debugging: Check if node and npm paths are valid
echo "<h3>Node and NPM Versions:</h3>";
$nodeVersion = [];
$npmVersion = [];
exec("$nodePath -v", $nodeVersion);
exec("$npmPath -v", $npmVersion);

echo "<h4>Node Version:</h4><pre>" . implode("\n", $nodeVersion) . "</pre>";
echo "<h4>NPM Version:</h4><pre>" . implode("\n", $npmVersion) . "</pre>";
?>
