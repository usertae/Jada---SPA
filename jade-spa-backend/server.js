const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
const PORT = 3000;

const db = new Database("jade_spa.db");

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

db.exec(`
    CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        telefone TEXT,
        data_nascimento TEXT
    );

    CREATE TABLE IF NOT EXISTS servicos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT,
        preco REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS agendamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER NOT NULL,
        servico_id INTEGER NOT NULL,
        data TEXT NOT NULL,
        horario TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Agendado',
        FOREIGN KEY (cliente_id) REFERENCES clientes(id),
        FOREIGN KEY (servico_id) REFERENCES servicos(id)
    );
`);

// DASHBOARD
app.get("/api/resumo", (req, res) => {
    const clientes = db.prepare(
        "SELECT COUNT(*) AS total FROM clientes"
    ).get().total;

    const servicos = db.prepare(
        "SELECT COUNT(*) AS total FROM servicos"
    ).get().total;

    const agendamentos = db.prepare(
        "SELECT COUNT(*) AS total FROM agendamentos"
    ).get().total;

    res.json({
        clientes,
        servicos,
        agendamentos
    });
});

// ==================== CLIENTES ====================

app.get("/api/clientes", (req, res) => {
    const clientes = db.prepare(
        "SELECT * FROM clientes ORDER BY id DESC"
    ).all();

    res.json(clientes);
});

app.post("/api/clientes", (req, res) => {
    const {
        nome,
        email,
        telefone,
        data_nascimento
    } = req.body;

    if (!nome || !email) {
        return res.status(400).json({
            erro: "Nome e e-mail são obrigatórios."
        });
    }

    try {
        const resultado = db.prepare(`
            INSERT INTO clientes
            (nome, email, telefone, data_nascimento)
            VALUES (?, ?, ?, ?)
        `).run(
            nome,
            email,
            telefone || "",
            data_nascimento || ""
        );

        res.status(201).json({
            mensagem: "Cliente cadastrado!",
            id: resultado.lastInsertRowid
        });

    } catch (erro) {
        res.status(400).json({
            erro: "Este e-mail já está cadastrado."
        });
    }
});

app.put("/api/clientes/:id", (req, res) => {
    const {
        nome,
        email,
        telefone,
        data_nascimento
    } = req.body;

    db.prepare(`
        UPDATE clientes
        SET nome = ?,
            email = ?,
            telefone = ?,
            data_nascimento = ?
        WHERE id = ?
    `).run(
        nome,
        email,
        telefone || "",
        data_nascimento || "",
        req.params.id
    );

    res.json({
        mensagem: "Cliente atualizado!"
    });
});

app.delete("/api/clientes/:id", (req, res) => {
    db.prepare(
        "DELETE FROM clientes WHERE id = ?"
    ).run(req.params.id);

    res.json({
        mensagem: "Cliente excluído!"
    });
});

// ==================== SERVIÇOS ====================

app.get("/api/servicos", (req, res) => {
    const servicos = db.prepare(
        "SELECT * FROM servicos ORDER BY id DESC"
    ).all();

    res.json(servicos);
});

app.post("/api/servicos", (req, res) => {
    const {
        nome,
        descricao,
        preco
    } = req.body;

    if (!nome) {
        return res.status(400).json({
            erro: "Nome do serviço é obrigatório."
        });
    }

    const resultado = db.prepare(`
        INSERT INTO servicos
        (nome, descricao, preco)
        VALUES (?, ?, ?)
    `).run(
        nome,
        descricao || "",
        Number(preco) || 0
    );

    res.status(201).json({
        mensagem: "Serviço cadastrado!",
        id: resultado.lastInsertRowid
    });
});

app.put("/api/servicos/:id", (req, res) => {
    const {
        nome,
        descricao,
        preco
    } = req.body;

    db.prepare(`
        UPDATE servicos
        SET nome = ?,
            descricao = ?,
            preco = ?
        WHERE id = ?
    `).run(
        nome,
        descricao || "",
        Number(preco) || 0,
        req.params.id
    );

    res.json({
        mensagem: "Serviço atualizado!"
    });
});

app.delete("/api/servicos/:id", (req, res) => {
    db.prepare(
        "DELETE FROM servicos WHERE id = ?"
    ).run(req.params.id);

    res.json({
        mensagem: "Serviço excluído!"
    });
});

// ==================== AGENDAMENTOS ====================

app.get("/api/agendamentos", (req, res) => {
    const agendamentos = db.prepare(`
        SELECT
            a.id,
            a.data,
            a.horario,
            a.status,
            c.nome AS cliente_nome,
            s.nome AS servico_nome
        FROM agendamentos a
        JOIN clientes c
            ON c.id = a.cliente_id
        JOIN servicos s
            ON s.id = a.servico_id
        ORDER BY a.data, a.horario
    `).all();

    res.json(agendamentos);
});

app.post("/api/agendamentos", (req, res) => {
    const {
        cliente_id,
        servico_id,
        data,
        horario
    } = req.body;

    if (!cliente_id || !servico_id || !data || !horario) {
        return res.status(400).json({
            erro: "Preencha todos os campos."
        });
    }

    const resultado = db.prepare(`
        INSERT INTO agendamentos
        (cliente_id, servico_id, data, horario)
        VALUES (?, ?, ?, ?)
    `).run(
        cliente_id,
        servico_id,
        data,
        horario
    );

    res.status(201).json({
        mensagem: "Agendamento criado!",
        id: resultado.lastInsertRowid
    });
});

app.put("/api/agendamentos/:id", (req, res) => {
    const { status } = req.body;

    db.prepare(`
        UPDATE agendamentos
        SET status = ?
        WHERE id = ?
    `).run(
        status,
        req.params.id
    );

    res.json({
        mensagem: "Status atualizado!"
    });
});

app.delete("/api/agendamentos/:id", (req, res) => {
    db.prepare(
        "DELETE FROM agendamentos WHERE id = ?"
    ).run(req.params.id);

    res.json({
        mensagem: "Agendamento excluído!"
    });
});

app.listen(PORT, () => {
    console.log("");
    console.log("=================================");
    console.log("       JADE SPA - ADMIN");
    console.log("=================================");
    console.log(`Servidor: http://localhost:${PORT}`);
    console.log("Banco SQLite conectado!");
    console.log("=================================");
});