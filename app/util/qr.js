const getQrUrl = (data) => {
  return `http://chart.apis.google.com/chart?chs=300&cht=qr&chl=${data}`;
};

export default {
  getQrUrl
}