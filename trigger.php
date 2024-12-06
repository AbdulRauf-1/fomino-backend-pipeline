<?php

// Path to your working directory
$workingDir = '/home/fomino/testingtsh.fomino.ch';
$logFile = '/home/fomino/testingtsh.fomino.ch/trigger_log.txt'; // Path to log file

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

// Using proc_open to better handle the command execution
$process = proc_open($npmInstallCommand, [
    1 => ['pipe', 'w'], // stdout
    2 => ['pipe', 'w'], // stderr
], $pipes);

if (is_resource($process)) {
    $npmOutput = stream_get_contents($pipes[1]); // Capture stdout
    $npmErrorOutput = stream_get_contents($pipes[2]); // Capture stderr
    fclose($pipes[1]);
    fclose($pipes[2]);
    $returnValue = proc_close($process); // Close the process and get the return value

    fwrite($log, "npm install output:\n$npmOutput\n");
    fwrite($log, "npm install error output:\n$npmErrorOutput\n");
    
    if ($returnValue !== 0) {
        fwrite($log, "npm install failed with return code: $returnValue\n");
        echo "npm install failed. Check the log for details.";
    } else {
        echo "npm install completed successfully.";
    }
} else {
    fwrite($log, "Failed to open process for npm install.\n");
    echo "Failed to run npm install. Check the log for details.";
}

// Optionally, start your app with pm2 after npm install (if needed)
$pm2StartCommand = "source $nvmPath && nvm use 16.20.2 && cd $workingDir && pm2 start app.js --name rauf 2>&1";
fwrite($log, "Running PM2 start command: $pm2StartCommand\n");

// Using proc_open to handle PM2 start command
$process = proc_open($pm2StartCommand, [
    1 => ['pipe', 'w'], // stdout
    2 => ['pipe', 'w'], // stderr
], $pipes);

if (is_resource($process)) {
    $pm2Output = stream_get_contents($pipes[1]); // Capture stdout
    $pm2ErrorOutput = stream_get_contents($pipes[2]); // Capture stderr
    fclose($pipes[1]);
    fclose($pipes[2]);
    $returnValue = proc_close($process); // Close the process and get the return value

    fwrite($log, "PM2 start output:\n$pm2Output\n");
    fwrite($log, "PM2 start error output:\n$pm2ErrorOutput\n");

    if ($returnValue !== 0) {
        fwrite($log, "PM2 start failed with return code: $returnValue\n");
        echo "Failed to start PM2. Check the log for details.";
    } else {
        echo "PM2 started successfully.";
    }
} else {
    fwrite($log, "Failed to open process for PM2 start.\n");
    echo "Failed to start PM2. Check the log for details.";
}

// Log the completion of the trigger
fwrite($log, date('Y-m-d H:i:s') . " - Trigger finished.\n");
fclose($log);

?>
