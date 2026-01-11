// This is a really weird supernova sky thing

var tickn = 0;

tick = () => {
  for (const id of api.getPlayerIds()) {
    api.setClientOption(id, "skyBox", {
      type: "earth",
      inclination: 0.4,
      turbidity: 100,
      luminance: tickn,
      azimuth: 0,
      infiniteDistance: 3,
      vertexTint: [255, 255, 255],
    });
  }

  tickn += 0.01;
};
