exports.getDate = function() {

  const today = new Date();

  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    timezone: "America/Sao_Paulo"
  };

  return today.toLocaleDateString("pt-BR", options);

};

exports.getDay = function () {

  const today = new Date();

  const options = {
    weekday: "long"
  };

  return today.toLocaleDateString("en-US", options);

};
