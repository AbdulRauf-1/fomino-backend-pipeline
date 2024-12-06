<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Path to your working directory
$workingDir = '/home/fomino/testingtsh.fomino.ch'; 

// Set up the correct environment variables for the shell
$nodeBinPath = '/home/fomino/.nvm/versions/node/v16.20.2/bin'; 

// Set the PATH environment variable explicitly using putenv()
putenv("PATH=$nodeBinPath:" . getenv('PATH')); 

// Command to run npm install
$command = "source /home/fomino/.nvm/nvm.sh && export HOME=/home/fomino && cd $workingDir && npm install";

// Set up the process environment
$descriptorspec = [
    0 => ["pipe", "r"],  // stdin
    1 => ["pipe", "w"],  // stdout
    2 => ["pipe", "w"],  // stderr
];

$process = proc_open($command, $descriptorspec, $pipes);

// Check if process is created
if (is_resource($process)) {
    // Get the output from the command
    $output = stream_get_contents($pipes[1]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    
    // Close the process
    $return_code = proc_close($process);

    // Output the result
    echo "Return code: $return_code<br>";
    echo nl2br($output);
} else {
    echo "Failed to start the process.<br>";
}
?>
