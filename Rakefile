FILES = %w(autorun-browser.js autorun-include.jsp autorun-lz.js hopkit.js jsspec.js lzmock.js lzspec.js lzunit-async.lzx lzunit-extensions.js)

# TODO: sync sequencing.js, hopkit.js with jsutils

def dirsync(source, target)
  FILES.each do |fname|
    s = File.expand_path(File.join(source, fname))
    t = File.expand_path(File.join(target, fname))
    if File.exists?(t) and File.mtime(s) < File.mtime(t)
      puts "#{s} is older than #{t}; did not copy"
    elsif !File.exists?(t) or File.mtime(s) > File.mtime(t)
      cp s, t
    end
  end
end

task :pull do
  dirsync('~/perforce/dc/client/applib/calendar/test/includes', 'src')
end

task :push do
  dirsync('src', '~/perforce/dc/client/applib/calendar/test/includes')
end
