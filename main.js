// This code is licensed under Apache 2.0
// Made by Yervweigh

const BAN_TIME = 1000 * 60 * 60;
const MOB_SPAWN_CHANCE = 1 / 800;
const MOB_SPAWN_DIST = 25;
const MOB_HERD_SIZE = 4;
const MOB_SPAWN_HEIGHT = 100;
const DAY_LENGTH = 1000 * 60 * 5;
const LIFESTEAL = 10;

var isNight = false;

tick = () => {
  const now = Date.now();
  const incl = now / DAY_LENGTH;
  isNight = Math.floor(incl + 0.5) % 2 == 1;

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
  let init = item?.attributes?.customDisplayName === "Data3";

  if (!init) {
    setData(id, { health: 100, banTime: 0 });
    return;
  }

  const { banTime, health } = item.attributes.customAttributes;

  if (banTime > Date.now()) {
    api.broadcastMessage(
      `${api.getEntityName(id)} is still too weak to continue ...`,
      { color: "cyan" },
    );
    api.kickPlayer(id, "No more HP");
    return;
  }

  api.setClientOption(id, "maxHealth", health);
};

onPlayerKilledOtherPlayer = (
  killer,
  victim,
) => {
  const killerName = api.getEntityName(killer);
  const diedName = api.getEntityName(victim);

  if (killer == victim) {
    return;
  }

  api.broadcastMessage(`${killerName} killed ${diedName}`, {
    color: "red",
  });

  const oldVictimHealth = api.getClientOption(victim, "maxHealth");
  if (oldVictimHealth <= LIFESTEAL) {
    api.broadcastMessage(`${diedName} was too weak to continue ...`, {
      color: "cyan",
    });

    api.kickPlayer(victim, "No more HP");
    setData(victim, { health: LIFESTEAL, banTime: Date.now() + BAN_TIME });
    return;
  }

  const oldKillerHealth = api.getClientOption(killer, "maxHealth");
  const newKillerHealth = oldKillerHealth + LIFESTEAL;
  const newVictimHealth = oldVictimHealth - LIFESTEAL;

  setData(killer, { health: newKillerHealth, banTime: 0 });
  setData(victim, { health: newVictimHealth, banTime: 0 });

  api.setClientOption(killer, "maxHealth", newKillerHealth);
  api.setClientOption(victim, "maxHealth", newVictimHealth);
};

onInventoryUpdated = (id) => {
  removeMsChest(id);
};

function spawnMobs(id) {
  if (isNight) {
    if (Math.random() < MOB_SPAWN_CHANCE) {
      const [x, _, z] = api.getPosition(id);
      const offsetX = x + Math.random() * MOB_SPAWN_DIST * 2 - MOB_SPAWN_DIST;
      const offsetZ = z + Math.random() * MOB_SPAWN_DIST * 2 - MOB_SPAWN_DIST;
      const herdId = api.createMobHerd();
      const mobN = Math.ceil(Math.random() * MOB_HERD_SIZE);
      for (let i = 0; i < mobN; i += 1) {
        api.attemptSpawnMob(
          "Draugr Zombie",
          offsetX,
          MOB_SPAWN_HEIGHT,
          offsetZ,
          {
            mobHerdId: herdId,
          },
        );
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
