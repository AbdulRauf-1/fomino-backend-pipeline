<?php
// Path to your working directory
$workingDir = '/home/fomino/testingtsh.fomino.ch';

// Load nvm to set the correct Node.js environment
$nvmPath = '/home/fomino/.nvm/nvm.sh'; // The path to nvm's script
$nodeBinPath = '/home/fomino/.nvm/versions/node/v16.20.2/bin'; // Path to node binaries directory
$npmPath = '/home/fomino/.nvm/versions/node/v16.20.2/bin/npm'; // Path to npm binaries directory

// Set environment variables for Node.js and npm
putenv("NVM_DIR=/home/fomino/.nvm");

// Set the command to run npm install
$command = "source $nvmPath && nvm use 16.20.2 && export PATH=$nodeBinPath:$npmPath:" . getenv('PATH') . " && export HOME=/home/fomino && cd $workingDir && npm install 2>&1";

// Set correct permissions for npm and node binaries and the working directory
$setPermissionsCommand = "chmod +x $nodeBinPath/node $npmPath && chmod -R 775 $workingDir";
shell_exec($setPermissionsCommand);

// Execute the npm install command
$output = shell_exec($command);

// Check if output is null
if ($output === null) {
    $output = "No output returned from shell command.";
}

// Output the result
echo nl2br($output);

// Optionally, start your app with pm2 after npm install (if needed)
$pm2StartCommand = "pm2 start app.js --name rauf";
$pm2Output = shell_exec("source $nvmPath && nvm use 16.20.2 && export PATH=$nodeBinPath:$npmPath:" . getenv('PATH') . " && export HOME=/home/fomino && cd $workingDir && $pm2StartCommand 2>&1");

// Output pm2 start result
if ($pm2Output !== null) {
    echo "<br><br>PM2 Output:<br>";
    echo nl2br($pm2Output);
} else {
    echo "<br><br>Failed to start the PM2 process.";
}
?>
