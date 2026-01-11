// This code is licensed under Apache 2.0
// Made by Yervweigh

const BAN_TIME = 1000 * 60 * 60;
const MOB_SPAWN_CHANCE = 1 / 800;
const DAY_LENGTH = 1000 * 60 * 3;

var night = false;

tick = () => {
  const now = Date.now();
  const incl = now / DAY_LENGTH;
  night = Math.floor(incl + 0.5) % 2 == 1;

  for (const id of api.getPlayerIds()) {
    api.setClientOption(id, "skyBox", {
      type: "earth",
      inclination: incl,
      turbidity: 10,
      luminance: 1,
      azimuth: 0,
      infiniteDistance: true,
      yCameraOffset: -1,
      vertexTint: [255, 255, 255],
    });

    spawnMobs(id);
  }
};

onPlayerJoin = (id) => {
  api.removeItemCraftingRecipes(id, "Moonstone Chest");
  removeMsChest(id);

  const item = api.getMoonstoneChestItemSlot(id, 0);
  if ((item?.attributes?.customDisplayName || null) != "Data3") {
    setData(id, { health: 100, banTime: 0 });
  } else {
    const banTime = item.attributes.customAttributes.banTime;
    if (banTime > Date.now()) {
      api.broadcastMessage(
        `${api.getEntityName(id)} is still too weak to continue ...`,
        { color: "cyan" },
      );
      api.kickPlayer(id, "No more HP");
      return;
    }
    const health = item.attributes.customAttributes.health;
    api.setClientOption(id, "maxHealth", health);
  }
};

onPlayerKilledOtherPlayer = (
  killer,
  died,
) => {
  const killerName = api.getEntityName(killer);
  const diedName = api.getEntityName(died);

  if (killer == died) {
    return;
  }

  api.broadcastMessage(`${killerName} killed ${diedName}`, {
    color: "red",
  });

  const oldHealthDied = api.getClientOption(died, "maxHealth");
  if (oldHealthDied <= 10) {
    api.broadcastMessage(`${diedName} was too weak to continue ...`, {
      color: "cyan",
    });

    api.kickPlayer(died, "No more HP");
    setData(died, { health: 10, banTime: Date.now() + BAN_TIME });
    return;
  }

  const oldHealthKiller = api.getClientOption(killer, "maxHealth");
  const newKillerHealth = oldHealthKiller + 10;
  const newDiedHealth = oldHealthDied - 10;

  setData(killer, { health: newKillerHealth, banTime: 0 });
  setData(died, { health: newDiedHealth, banTime: 0 });

  api.setClientOption(killer, "maxHealth", newKillerHealth);
  api.setClientOption(died, "maxHealth", newDiedHealth);
};

onInventoryUpdated = (id) => {
  removeMsChest(id);
};

function spawnMobs(id) {
  if (night) {
    if (Math.random() < MOB_SPAWN_CHANCE) {
      const [x, y, z] = api.getPosition(id);
      const offsetX = x + Math.random() * 25;
      const offsetZ = z + Math.random() * 25;
      const herdId = api.createMobHerd();
      const mobN = Math.ceil(Math.random() * 4);
      for (let i = 0; i < mobN; i += 1) {
        api.attemptSpawnMob("Draugr Zombie", offsetX, y, offsetZ, {
          mobHerdId: herdId,
        });
      }
    }
  }
}

function removeMsChest(id) {
  const amount = api.getInventoryItemAmount(id, "Moonstone Chest");
  if (amount > 0) {
    api.removeItemName(id, "Moonstone Chest", amount);
    api.sendMessage(
      id,
      "Moonstone chests are not allowed because I am an incompetent coder",
      {
        color: "orange",
      },
    );
  }
}

function setData(id, data) {
  api.setMoonstoneChestItemSlot(id, 0, "Black Wool", 1, {
    customDisplayName: "Data3",
    customAttributes: data,
  });
}
