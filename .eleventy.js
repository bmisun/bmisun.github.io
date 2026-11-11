const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");

  // Nunjucks에 date 필터가 없어서 현재 연도는 전역 데이터로 제공
  eleventyConfig.addGlobalData("currentYear", () => new Date().getFullYear());

  // 코드블록 문법 강조는 빌드 타임 Prism (토큰 색상은 style.scss의 .token.*)
  eleventyConfig.addPlugin(syntaxHighlight);

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
