RELEASE_VERSION = '0.9a1'
ARCHIVE_NAME = "lztestkit-#{RELEASE_VERSION}.tgz"
IGNORE = Dir['**/#*#'] + Dir['**/.#*']

task :archive => ARCHIVE_NAME
file ARCHIVE_NAME => Dir['**/*'] - ['Rakefile'] - Dir['*.tgz'] - IGNORE do |t|
  puts t.prerequisites
  sh "tar cfz #{t.name} #{t.prerequisites}"
end

task :publish => ARCHIVE_NAME do
  sh "scp README #{ARCHIVE_NAME} osteele.com:osteele.com/sources/openlaszlo/lztestkit"
end

task :clean do
  files = Dir['*.tgz']
  rm files if files.any?
end

SHARED_FILES = %w(autorun-browser.js autorun-include.jsp autorun-lz.js hopkit.js jsspec.js lzmock.js lzspec.js lzunit-async.lzx lzunit-extensions.js)

# TODO: sync sequencing.js, hopkit.js with jsutils

def dirsync(source_dir, target_dir)
  options = {}
  options[:noop] = true if ENV['dryrun']
  SHARED_FILES.each do |fname|
    source = File.expand_path(File.join(source_dir, fname))
    target = File.expand_path(File.join(target_dir, fname))
    copy = false
    case
    when !File.exists?(target)
      copy = true
    when (File.size(source) == File.size(target) and
            File.read(source) == File.read(target))
      copy = false
    when File.mtime(source) < File.mtime(target)
      puts "Skipping #{fname}: source is older than target"
      sh "ls -l {#{source_dir},#{target_dir}}/#{fname}" if ENV['verbose']
    else
      copy = true
    end
    cp source, target, options if copy
  end
end

task :pull do
  dirsync('~/perforce/dc/client/applib/calendar/test/includes', 'src')
end

task :push do
  dirsync('src', '~/perforce/dc/client/applib/calendar/test/includes')
end
