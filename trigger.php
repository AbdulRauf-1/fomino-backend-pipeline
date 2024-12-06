<?php
echo "Debugging: Before chmod <br>";
$setBinaryPermissions = exec("chmod +x /home/fomino/.nvm/versions/node/v16.20.2/bin/node /home/fomino/.nvm/versions/node/v16.20.2/bin/npm 2>&1");
echo "Debugging: After chmod <br>";

// Check the permissions
echo "Permissions: <br>" . nl2br($setBinaryPermissions) . "<br>";

$workingDir = '/home/fomino/testingtsh.fomino.ch';
$nodePath = '/home/fomino/.nvm/versions/node/v16.20.2/bin/node';
$npmPath = '/home/fomino/.nvm/versions/node/v16.20.2/bin/npm';

// Check if node and npm paths are valid
echo "Node Path: $nodePath <br>";
echo "NPM Path: $npmPath <br>";

exec("$nodePath -v", $output, $return_var);
echo "Node Version: <br>" . implode("\n", $output) . "<br>";

// Check if npm install works
exec("cd $workingDir && $npmPath install", $output, $return_var);
echo "Output: <br>" . implode("\n", $output) . "<br>";
echo "Return Code: $return_var <br>";
?>
