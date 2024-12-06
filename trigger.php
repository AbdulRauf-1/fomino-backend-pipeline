<?php
// Path to your working directory
$workingDir = '/home/fomino/testingtsh.fomino.ch';

// Set up the correct environment variables for the shell
$nodeBinPath = '/home/fomino/.nvm/versions/node/v16.20.2/bin/node'; // Path to node binaries
$npmPath = '/home/fomino/.nvm/versions/node/v16.20.2/bin/npm';
$Paths = '/home/fomino/.nvm/versions/node/v16.20.2/bin/';

// Set the PATH environment variable explicitly using putenv()
putenv("PATH=$npmBinPath:$npmPath:$paths" . getenv('PATH')); // Prepend nodeBinPath to system PATH

// Command to create the PM2 process and save it again
$npmCommand = "npm install";

// Combine all commands
$command = "export HOME=/home/fomino && cd $workingDir && $npmCommand 2>&1";
// Execute the command
$output = shell_exec($command);

// Check if output is null
if ($output === null) {
    $output = "No output returned from shell command.";
}

// Output the result
echo nl2br($output);
?>

