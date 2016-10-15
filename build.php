#!/usr/bin/php
<?php
namespace com\leon\bcplus\build;

/**
 * Build class used to create an installable userscript from BCPlus source
 * 
 * @author	Stefan Hahn
 * @copyright	2016 Stefan Hahn
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 */
class Builder {
	const DEFAULT_CONFIG_FILE = './buildconfig.json';
	
	protected $configFile = '';
	protected $config = null;
	protected $silent = false;
	
	protected $fInfo = null;
	
	protected $namespaces = '';
	protected $header = '';
	protected $functions = '';
	protected $bcplus = '';
	
	protected $utils = [];
	protected $mediaResources = [];
	protected $modules = [];
	
	protected $buildResult = '';
	protected $buildResultFile = '';
	
	public function __construct($configFile = Builder::DEFAULT_CONFIG_FILE, $silent = false) {
		$this->configFile = $configFile;
		$this->silent = $silent;
		$this->fInfo = new \finfo(FILEINFO_MIME_TYPE);
		
		if (!$this->silent) echo "BCPlus build script\n";
		
		$this->loadConfig();
		$this->validateConfig();
	}
	
	public function run() {
		if (!$this->silent) echo "Starting build process\n";
		
		$this->loadFrame();
		$this->loadUtils();
		$this->loadMediaResources();
		$this->loadModules();
		
		$this->build();
		$this->saveBuildResult();
	}
	
	public function getBuildResult() {
		return $this->buildResult;
	}
	
	public function deployFtp() {
		if (!isset($this->config->ftp)) {
			throw new \Exception('FTP config not set');
		}
		
		if (isset($this->config->ftp->deployDev) && !$this->config->ftp->deployDev && (false !== strpos($this->config->version, 'dev'))) {
			if (!$this->silent) echo "Not deploying dev version to ftp host due to configuration\n";
			
			return;
		}
		
		if (!$this->silent) echo "Deploying to ftp host " . $this->config->ftp->host . "\n";
		
		$ftp = null;
		
		if (function_exists('ftp_ssl_connect')) {
			$ftp = ftp_ssl_connect($this->config->ftp->host);
		}
		else {
			$ftp = ftp_connect($this->config->ftp->host);
		}
		
		if (false === $ftp) {
			throw new \Exception('Couldn\'t create ftp connection');
		}
		
		if (false === ftp_login($ftp, $this->config->ftp->username, $this->config->ftp->password)) {
			throw new \Exception('Invalid ftp credentials');
		}
		
		if (false === ftp_pasv($ftp, true)) {
			throw new \Exception('Couldn\'t enter ftp passive mode');
		}
		
		if (false === ftp_put($ftp, $this->config->ftp->path . basename($this->buildResultFile), $this->buildResultFile, FTP_BINARY)) {
			throw new \Exception('Couldn\'t upload build result to ftp server');
		}
		
		ftp_close($ftp);
	}
	
	public function deployLocal() {
		if (!isset($this->config->deploy)) {
			throw new \Exception('Deploy config not set');
		}
		
		$filename = str_replace(' ', '_', basename($this->buildResultFile));
		
		foreach ($this->config->deploy->paths as $deployPath) {
			if (!is_dir($deployPath)) {
				continue;
			}
			
			$existingFile = glob($deployPath . '*.user.js');
			
			if (1 === count($existingFile)) {
				if (!$this->silent) echo "Deploying to local path " . $existingFile[0] . "\n";
				
				if (false === copy($this->buildResultFile, $existingFile[0])) {
					file_put_contents('php://stderr', "Couldn't deploy to " . $existingFile[0] . "\n");
				}
			}
			else if (empty($existingFile)) {
				if (!$this->silent) echo "Deploying to local path " . $deployPath . $filename . "\n";
				
				if (false === copy($this->buildResultFile, $deployPath . $filename)) {
					file_put_contents('php://stderr', "Couldn't deploy to " . $deployPath . $filename . "\n");
				}
			}
			else {
				file_put_contents('php://stderr', "Couldn't deploy to " . $deployPath . "\n");
				continue;
			}
		}
	}
	
	protected function loadConfig() {
		if (!$this->silent) echo "Loading build config\n";
		
		if (!file_exists($this->configFile)) {
			throw new \Exception('Config file doesn\'t exist.');
		}
		
		$this->config = json_decode(file_get_contents($this->configFile));
	}
	
	protected function validateConfig() {
		if (!$this->silent) echo "Validating build config\n";
		
		$this->validateVersion();
		$this->validateBuildpath();
		$this->validateModules();
		$this->validateFtp();
		$this->validateDeploy();
	}
	
	protected function loadFrame() {
		$this->loadNamespaces();
		$this->loadHeader();
		$this->loadFunctions();
		$this->loadBCPlus();
	}
	
	protected function loadUtils() {
		$utilPaths = glob('util/*.js');
		
		sort($utilPaths, SORT_NATURAL | SORT_FLAG_CASE);
		foreach ($utilPaths as $utilPath) {
			if (!$this->silent) echo "Loading util " . basename($utilPath, '.js') . "\n";
			
			$utilContent = file_get_contents($utilPath);
			
			if (!empty($utilContent)) {
				$this->utils[] = $utilContent;
			}
		}
	}
	
	protected function loadMediaResources() {
		$mediaResourcePaths = glob('media/*');
		
		foreach ($mediaResourcePaths as $mediaResourcePath) {
			if (!$this->silent) echo "Loading media resource " . basename($mediaResourcePath) . "\n";
			
			$name = substr(basename($mediaResourcePath), 0, strrpos(basename($mediaResourcePath), '.'));
			$mimeType = $this->fInfo->file($mediaResourcePath);
			$base64Content = base64_encode(file_get_contents($mediaResourcePath));
			$this->mediaResources[] = <<<MEDIA
Media.$name = {
	mimeType: '$mimeType',
	content: '$base64Content',
	get dataURI() {
		return 'data:' + this.mimeType + ';base64,' + this.content;
	}
};
MEDIA;
		}
	}
	
	protected function loadModules() {
		foreach ($this->config->modules as $module) {
			if (!$this->silent) echo "Loading module " . $module . "\n";
			
			if (!file_exists('./modules/' . $module . '.js')) {
				throw new \Exception('Module ' . $module . ' doesn\'t exist');
			}
			
			$moduleContent = file_get_contents('./modules/' . $module . '.js');
			
			if (empty($moduleContent)) {
				throw new \Exception('Module ' . $module . ' is empty');
			}
			
			$this->modules[] = $moduleContent;
		}
	}
	
	protected function build() {
		if (!$this->silent) echo "Start building\n";
		
		$content = '';
		
		$content .= $this->namespaces . "\n";
		$content .= implode("\n", $this->utils) . "\n";
		$content .= implode("\n", $this->mediaResources) . "\n";
		$content .= implode("\n", $this->modules) . "\n";
		$content .= $this->bcplus;
		
		$content = trim($content);
		$content = str_replace("\n", "\n\t\t", $content);
		
		$this->buildResult = $this->header;
		$this->buildResult = str_replace('/*{content}*/', $content, $this->buildResult);
		$this->buildResult = str_replace('/*{functions}*/', str_replace("\n", "\n\t", trim($this->functions)), $this->buildResult);
		$this->buildResult = str_replace('/*{version}*/', $this->config->version, $this->buildResult);
	}
	
	protected function saveBuildResult() {
		$this->buildResultFile = $this->config->buildpath . 'BisaChat Plus ' . $this->config->version .'.user.js';
		
		if (!$this->silent) echo "Writing build result file " . $this->buildResultFile . "\n";
		
		if (false === file_put_contents($this->buildResultFile, $this->getBuildResult())) {
			throw new \Exception('Couldn\'t write build result file');
		}
	}
	
	protected function validateVersion() {
		if (!isset($this->config->version)) {
			throw new \Exception('No version given');
		}
		
		if (1 !== preg_match('/^(\d+\.\d+\.\d+)(?:(dev|a|b|rc)(\d+(dev)?)?)?$/', $this->config->version)) {
			throw new \Exception('Invalid version given');
		}
	}
	
	protected function validateBuildpath() {
		if (!isset($this->config->buildpath)) {
			throw new \Exception('No buildpath given');
		}
	}
	
	protected function validateModules() {
		if (!isset($this->config->modules) || !is_array($this->config->modules)) {
			throw new \Exception('Invalid modules list');
		}
	}
	
	protected function validateFtp() {
		if (isset($this->config->ftp)) {
			if (!isset($this->config->ftp->host) || !isset($this->config->ftp->username) || !isset($this->config->ftp->password) || !isset($this->config->ftp->path)) {
				throw new \Exception('Invalid ftp config');
			}
		}
	}
	
	protected function validateDeploy() {
		if (isset($this->config->deploy)) {
			if (!isset($this->config->deploy->paths) || !is_array($this->config->deploy->paths)) {
				throw new \Exception('Invalid deploy config');
			}
		}
	}
	
	protected function loadNamespaces() {
		if (file_exists('./namespaces.js')) {
			if (!$this->silent) echo "Loading namespaces\n";
			
			$this->namespaces = file_get_contents('./namespaces.js');
		}
	}
	
	protected function loadHeader() {
		if (!$this->silent) echo "Loading header\n";
		
		if (!file_exists('./namespaces.js')) {
			throw new \Exception('Header file doesn\'t exist');
		}
		
		$this->header = file_get_contents('./header.js');
		
		if (empty($this->header)) {
			throw new \Exception('Header file is empty');
		}
	}
	
	protected function loadFunctions() {
		if (file_exists('./functions.js')) {
			if (!$this->silent) echo "Loading functions\n";
			
			$this->functions = file_get_contents('./functions.js');
		}
	}
	
	protected function loadBCPlus() {
		if (!$this->silent) echo "Loading BisaChatPlus\n";
		
		if (!file_exists('./BisaChatPlus.js')) {
			throw new \Exception('BisaChatPlus file doesn\'t exist');
		}
		
		$this->bcplus = file_get_contents('./BisaChatPlus.js');
		
		if (empty($this->bcplus)) {
			throw new \Exception('BisaChatPlus file is empty');
		}
	}
}

try {
	if ('cli' !== strtolower(php_sapi_name())) {
		throw new \Exception('Build script has to be called from CLI SAPI');
	}
	
	$b = new Builder();
	
	$b->run();
	
	if (false === array_search('--no-ftp-deploy', $argv, true)) {
		$b->deployFtp();
	}
	
	if (false === array_search('--no-local-deploy', $argv, true)) {
		$b->deployLocal();
	}
}
catch (\Exception $e) {
	echo $e;
}
