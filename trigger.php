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
$npmCommand = "source /home/fomino/.nvm/nvm.sh && export HOME=/home/fomino && cd $workingDir && npm install";

// Command to stop and delete the existing PM2 process
$pm2StopDeleteCommand = "pm2 stop rauf || true && pm2 delete rauf || true";

// Command to start the app using PM2 and save the configuration
$pm2StartCommand = "pm2 start app.js --name rauf && pm2 save";

// Set up the process environment
$descriptorspec = [
    0 => ["pipe", "r"],  // stdin
    1 => ["pipe", "w"],  // stdout
    2 => ["pipe", "w"],  // stderr
];

// First, run npm install
$installCommand = $npmCommand;

// Run the npm install command and capture output
$process = proc_open($installCommand, $descriptorspec, $pipes);

// Check if process is created
if (is_resource($process)) {
    $installOutput = stream_get_contents($pipes[1]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    $installReturnCode = proc_close($process);

    // Check if npm install was successful
    if ($installReturnCode === 0) {
        echo "NPM install completed successfully.<br>";
        echo nl2br($installOutput);
        
        // Now, run the PM2 commands to stop, delete, and start the app
        $pm2Command = $pm2StopDeleteCommand . " && " . $pm2StartCommand;
        $process = proc_open($pm2Command, $descriptorspec, $pipes);
        
        if (is_resource($process)) {
            $pm2Output = stream_get_contents($pipes[1]);
            fclose($pipes[1]);
            fclose($pipes[2]);
            $pm2ReturnCode = proc_close($process);
            
            if ($pm2ReturnCode === 0) {
                echo "PM2 process started successfully.<br>";
                echo nl2br($pm2Output);
            } else {
                echo "Failed to start PM2 process. Return code: $pm2ReturnCode<br>";
                echo nl2br($pm2Output);
            }
        } else {
            echo "Failed to start PM2 process.<br>";
        }
    } else {
        echo "NPM install failed. Return code: $installReturnCode<br>";
        echo nl2br($installOutput);
    }
} else {
    echo "Failed to start npm install process.<br>";
}
?>
