const { read } = require("fs-extra");
const { default: status } = require("http-status");

module.exports = (sequelize, DataTypes) => {
    const chat = sequelize.define("chat", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        sender: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        receiver: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        read_status: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        read_by: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            comment: 'Array of user UUIDs who have read this message'
        },
        file_path: {
            type: DataTypes.STRING, 
            allowNull: true,
        },
        file_type: {
            type: DataTypes.ENUM("text", "image", "voice"),
            allowNull: false,
            defaultValue: "text",
        },
        }, {
        timestamps: true,
        tableName: "chats"
    });

    return chat;
}

