const BAN_TIME = 1000 * 100;

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
