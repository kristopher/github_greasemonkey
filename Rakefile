def sprocketize(path, source, destination)
  
  require "sprockets"

  secretary = Sprockets::Secretary.new(
    :root         => File.join(File.dirname(__FILE__), path),
    :source_files => [source],
    :strip_comments => false
  )
  
  secretary.concatenation.save_to(File.join(File.dirname(__FILE__), "dist", destination))
end

desc "Builds the distribution."
task :dist do
  sprocketize("src", "github_greasemonkey.js", "github_greasemonkey.user.js")
end
