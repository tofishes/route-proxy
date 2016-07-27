template.helper('thumb', (input, size, crop) => {
  if (!input || input.indexOf('aliyuncs.com') < 0) {
    return input;
  }
  // 修正域名，img-cn域名才可以接受缩略图参数
  const image = input.replace('oss-cn', 'img-cn');
  const alias = {
    'full': '1600',
    'large': '960',
    'medium': '480',
    'small': '280',
    'tiny': '120',
    'micro': '48'
  };
  // 默认获取small级别缩略图
  size = size || 'small';

  if (alias[size]) {
    size = alias[size];
  }

  if (size == + size)
    size = `${size}w_${size}h`;

  let cropParam = '';

  if (crop) {
    cropParam = '_1c_1e';
  }
  return `${image}@${size}${cropParam}`;
});
