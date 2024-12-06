<?php
// Path to your working directory
$workingDir = '/home/fomino/testingtsh.fomino.ch';

// Load nvm to set the correct Node.js environment
$nvmPath = '/home/fomino/.nvm/nvm.sh'; // The path to nvm's script

// Set the correct environment variables for the shell
$nodeBinPath = '/home/fomino/.nvm/versions/node/v16.20.2/bin'; // Path to node binaries directory
$npmPath = '/home/fomino/.nvm/versions/node/v16.20.2/bin/npm';

// Set permissions for node and npm binaries
$setBinaryPermissions = shell_exec("chmod +x $nodeBinPath $npmPath 2>&1");

// Set permissions for the working directory
$setDirPermissions = shell_exec("chmod -R 775 $workingDir 2>&1");

// Ensure NVM is loaded and the correct paths are set
putenv("NVM_DIR=/home/fomino/.nvm");
$command = "source $nvmPath && nvm use 16.20.2 && export PATH=$nodeBinPath:$npmPath:" . getenv('PATH') . " && export HOME=/home/fomino && cd $workingDir && npm install 2>&1";

// Execute the command
$output = shell_exec($command);

// Check if output is null
if ($output === null) {
    $output = "No output returned from shell command.";
}

// Output the result
echo nl2br($output);
?>
