import PogObject from "PogData";

export const data = new PogObject(
    "SingingMage",
    {
        query: "Creep Radiohead",
        enabled: true,
    },
    "data.json"
);

register("gameUnload", () => {
    data.save();
});

data.autosave();
