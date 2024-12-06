<?php

// Path to your working directory
$workingDir = '/home/fomino/testingtsh.fomino.ch';
$logFile = '/home/fomino/trigger_log.txt'; // Path to log file

// Load nvm to set the correct Node.js environment
$nvmPath = '/home/fomino/.nvm/nvm.sh'; // The path to nvm's script
$nodeBinPath = '/home/fomino/.nvm/versions/node/v16.20.2/bin'; // Path to node binaries directory
$npmPath = '/home/fomino/.nvm/versions/node/v16.20.2/bin/npm'; // Path to npm binaries directory
$pm2Path = '/home/fomino/bin/pm2'; // Path to PM2

// Open log file for appending logs
$log = fopen($logFile, 'a');
if ($log === false) {
    echo "Unable to open log file for writing.";
    exit;
}
fwrite($log, "\n\n" . date('Y-m-d H:i:s') . " - Trigger started.\n");

// Set environment variables
putenv("NVM_DIR=/home/fomino/.nvm");
$pathEnv = "$nodeBinPath:$pm2Path:" . getenv('PATH');
putenv("PATH=$pathEnv");
fwrite($log, "Set PATH: $pathEnv\n");

// Set correct permissions for binaries and the working directory
$setPermissionsCommand = "chmod +x $nodeBinPath/node $npmPath $pm2Path && chmod -R 775 $workingDir";
fwrite($log, "Running permission command: $setPermissionsCommand\n");
$setPermissionsOutput = shell_exec($setPermissionsCommand);
fwrite($log, "Permissions command output: $setPermissionsOutput\n");

// Command to load nvm and execute npm install
$npmInstallCommand = "source $nvmPath && nvm use 16.20.2 && cd $workingDir && npm install 2>&1";
fwrite($log, "Running npm install command: $npmInstallCommand\n");
$npmOutput = shell_exec($npmInstallCommand);
fwrite($log, "npm install output: $npmOutput\n");

// Check if output is null
if ($npmOutput === null || trim($npmOutput) === '') {
    $npmOutput = "No output returned from npm install command.";
    fwrite($log, "Error: $npmOutput\n");
    echo nl2br($npmOutput);
}

// Optionally, start your app with pm2 after npm install (if needed)
$pm2StartCommand = "source $nvmPath && nvm use 16.20.2 && cd $workingDir && pm2 start app.js --name rauf 2>&1";
fwrite($log, "Running PM2 start command: $pm2StartCommand\n");
$pm2Output = shell_exec($pm2StartCommand);
fwrite($log, "PM2 output: $pm2Output\n");

// Output npm and PM2 result for debugging
echo "<br><br>npm Output:<br>" . nl2br($npmOutput);
if ($pm2Output !== null && trim($pm2Output) !== '') {
    echo "<br><br>PM2 Output:<br>" . nl2br($pm2Output);
    fwrite($log, "PM2 process started successfully.\n");
} else {
    echo "<br><br>Failed to start the PM2 process. Check if PM2 is installed and configured properly.";
    fwrite($log, "Error: Failed to start PM2.\n");
}

fwrite($log, date('Y-m-d H:i:s') . " - Trigger finished.\n");
fclose($log);

?>
