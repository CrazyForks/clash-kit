require "language/node"

class ClashKit < Formula
  desc "A command-line interface for managing Clash configurations, subscriptions, and proxies"
  homepage "https://github.com/wangrongding/clash-kit"
  url "https://registry.npmjs.org/clash-kit/-/clash-kit-1.1.6.tgz"
  sha256 "2dc2cf924752657062dbd15e08d497f1bc9b0d7eeba8db2ac00a6107b7dfc5d7"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    system "#{bin}/ck", "--version"
  end
end
