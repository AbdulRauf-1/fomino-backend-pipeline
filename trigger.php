<?php
// Path to your working directory
$workingDir = '/home/fomino/testingtsh.fomino.ch';

// Set up the correct environment variables for the shell
$nodeBinPath = '/home/fomino/.nvm/versions/node/v16.20.2/bin/node'; // Path to node binaries
$pm2BinPath = '/home/fomino/bin/pm2'; // Path to PM2 binary directory

// Set the PATH environment variable explicitly using putenv()
putenv("PATH=$nodeBinPath:" . getenv('PATH')); // Prepend nodeBinPath to system PATH

// Define the process name for clarity
$processName = 'rauf';

// Commands for PM2 management
$pm2StopDeleteCommand = "pm2 stop $processName || true && pm2 delete $processName || true";
$pm2SaveCommand = "pm2 save";

// Command to create the PM2 process and save it again
$pm2CreateCommand = "npm install";// && pm2 start app.js --name $processName && pm2 save";

// Combine all commands
$command = "export HOME=/home/fomino && cd $workingDir && $pm2CreateCommand 2>&1";
// Execute the command
$output = shell_exec($command);

// Check if output is null
if ($output === null) {
    $output = "No output returned from shell command.";
}

// Output the result
echo nl2br($output);
?>