const trucanteText = (content, limit) => {
  const filteredContent = content.replace(/#{1,3}\s|```/g, "");
  const words = filteredContent.split(" ");
  if (words.length > limit) {
    return words.slice(0, limit).join(" ") + "...";
  }
  return content;
};

module.exports = trucanteText;
