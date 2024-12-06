<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Define paths to your working directory and node/npm binaries
$workingDir = '/home/fomino/testingtsh.fomino.ch';
$nodePath = '/home/fomino/.nvm/versions/node/v16.20.2/bin/node';
$npmPath = '/home/fomino/.nvm/versions/node/v16.20.2/bin/npm';

// Ensure the PATH environment variable includes the necessary directories
$path = getenv('PATH') . ':/home/fomino/.nvm/versions/node/v16.20.2/bin';
putenv("PATH=$path");

// Debugging: Output environment variables
echo "<h3>Environment Variables:</h3>";
echo "<pre>";
print_r($_SERVER);
echo "</pre>";

// Check if Node.js and npm paths are accessible
echo "<h3>Node.js and npm Path Validation:</h3>";
echo "<pre>";
if (file_exists($nodePath)) {
    echo "Node.js found at: $nodePath\n";
} else {
    echo "Error: Node.js binary not found at $nodePath\n";
}

if (file_exists($npmPath)) {
    echo "npm found at: $npmPath\n";
} else {
    echo "Error: npm binary not found at $npmPath\n";
}
echo "</pre>";

// Check Node.js and npm versions
echo "<h3>Node.js and npm Versions:</h3>";
echo "<pre>";
$nodeVersion = shell_exec("$nodePath -v 2>&1");
$npmVersion = shell_exec("$npmPath -v 2>&1");
echo "Node.js Version: $nodeVersion\n";
echo "npm Version: $npmVersion\n";
echo "</pre>";

// Change to the working directory
if (!is_dir($workingDir)) {
    die("<b>Error:</b> Working directory $workingDir does not exist.\n");
}
chdir($workingDir);

// Debugging: Check current working directory
echo "<h3>Current Working Directory:</h3>";
echo "<pre>";
echo getcwd();
echo "</pre>";

// Run npm install
echo "<h3>Running npm install:</h3>";
$command = "$npmPath install 2>&1";
$output = [];
$returnVar = 0;
exec($command, $output, $returnVar);

// Display command output
echo "<h3>Command Output:</h3>";
echo "<pre>";
echo implode("\n", $output);
echo "</pre>";

// Display command return status
echo "<h3>Command Return Code:</h3>";
echo "<pre>$returnVar</pre>";

// Final check
if ($returnVar === 0) {
    echo "<h3>Success:</h3><p>npm install executed successfully!</p>";
} else {
    echo "<h3>Error:</h3><p>npm install failed with return code $returnVar. Check the output above for more details.</p>";
}
?>
