<?php
// Path to your working directory
$workingDir = '/home/fomino/testingtsh.fomino.ch'; // Adjusted to match your cPanel directory

// Set up the correct environment variables for the shell
$nodeBinPath = '/home/fomino/.nvm/versions/node/v16.20.2/bin'; // Path to node and npm binaries
$pm2Path = '/bin/pm2'; // Path to pm2 binary

// Set the PATH environment variable explicitly using putenv()
putenv("PATH=$nodeBinPath:" . getenv('PATH')); // Prepend nodeBinPath to system PATH

// Define the process name for clarity
$processName = 'fomino'; // Adjust process name if necessary

// Commands for PM2 management
$pm2StopDeleteCommand = "$pm2Path stop $processName || true && $pm2Path delete $processName || true";
$pm2SaveCommand = "$pm2Path save";

// Command to create the PM2 process and save it again
$pm2CreateCommand = "npm install && $pm2Path start shipping.js --name $processName && $pm2Path save";

// Combine all commands
$command = "export HOME=/home/fomino && cd $workingDir && $pm2StopDeleteCommand && $pm2SaveCommand && $pm2CreateCommand 2>&1";

// Execute the command
$output = shell_exec($command);

// Check if output is null
if ($output === null) {
    $output = "No output returned from shell command.";
}

// Output the result
echo nl2br($output);
?>
