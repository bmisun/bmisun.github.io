// 폴더명은 component 그대로 두고 출력 URL만 /components/<slug>/로 변경
// (폴더를 옮기면 얽힌 파일이 많아 이름만 바꾸는 이득 대비 리스크가 큼)
module.exports = {
  permalink: (data) => `/components/${data.page.fileSlug}/index.html`,
};
