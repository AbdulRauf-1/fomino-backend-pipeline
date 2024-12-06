<?php
// Path to your working directory
$workingDir = '/home/fomino/testingtsh.fomino.ch';
$logFile = '/home/fomino/testingtsh.fomino.ch/trigger_log.txt'; // Path to log file

// Load nvm to set the correct Node.js environment
$nvmPath = '/home/fomino/.nvm/nvm.sh'; // The path to nvm's script
$nodeBinPath = '/home/fomino/.nvm/versions/node/v16.20.2/bin'; // Path to node binaries directory
$npmPath = '/home/fomino/.nvm/versions/node/v16.20.2/bin/npm'; // Path to npm binaries directory

// Open log file for appending logs
$log = fopen($logFile, 'a');
if ($log === false) {
    echo "Unable to open log file for writing.";
    exit;
}

fwrite($log, "\n\n" . date('Y-m-d H:i:s') . " - Trigger started.\n");

// Set environment variables for Node.js and npm
putenv("NVM_DIR=/home/fomino/.nvm");

// Ensure NVM is loaded and the correct paths are set
$command = "source $nvmPath && nvm use 16.20.2 && export PATH=$nodeBinPath:$npmPath:" . getenv('PATH') . " && export HOME=/home/fomino && cd $workingDir && npm install 2>&1";

// Set correct permissions for npm and node binaries and the working directory
$setPermissionsCommand = "chmod +x $nodeBinPath/node $npmPath && chmod -R 775 $workingDir";

// Log the permission setting command
fwrite($log, "Running permission command: $setPermissionsCommand\n");
$setPermissionsOutput = shell_exec($setPermissionsCommand);

// Log the output of the permission setting command
fwrite($log, "Permissions command output: $setPermissionsOutput\n");

// Log the npm install command
fwrite($log, "Running npm install command: $command\n");
$output = shell_exec($command);

// Log the output of npm install
fwrite($log, "npm install output: $output\n");

// Check if output is null
if ($output === null) {
    $output = "No output returned from shell command.";
    fwrite($log, "Error: No output returned.\n");
}

// Output the result
echo nl2br($output);
fwrite($log, "Trigger finished.\n");

fclose($log);

// Optionally, start your app with pm2 after npm install (if needed)
$pm2StartCommand = "pm2 start app.js --name rauf";

// Log pm2 command
fwrite($log, "Running pm2 start command: $pm2StartCommand\n");
$pm2Output = shell_exec("source $nvmPath && nvm use 16.20.2 && export PATH=$nodeBinPath:$npmPath:" . getenv('PATH') . " && export HOME=/home/fomino && cd $workingDir && $pm2StartCommand 2>&1");

// Log pm2 output
fwrite($log, "PM2 output: $pm2Output\n");

// Output pm2 start result
if ($pm2Output !== null) {
    echo "<br><br>PM2 Output:<br>";
    echo nl2br($pm2Output);
    fwrite($log, "PM2 process started successfully.\n");
} else {
    echo "<br><br>Failed to start the PM2 process. Check if PM2 is installed and configured properly.";
    fwrite($log, "Error: Failed to start PM2.\n");
}

?>
