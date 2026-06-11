const isGitHubPages = process.env.GITHUB_ACTIONS === "true";
const basePath = isGitHubPages ? "/household-app" : "";

const nextConfig = {
  output: "export",
  outputFileTracingRoot: process.cwd(),
  trailingSlash: true,
  basePath,
  assetPrefix: basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};
export default nextConfig;
