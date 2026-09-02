let clientes = [];
let servicos = [];
let agendamentos = [];

let editandoCliente = null;
let editandoServico = null;


// ==================== FUNÇÕES GERAIS ====================

async function api(url, options = {}) {

    const resposta = await fetch(url, {
        headers: {
            "Content-Type": "application/json"
        },
        ...options
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(dados.erro || "Erro na operação.");
    }

    return dados;
}


function mostrarMensagem(texto) {

    const mensagem = document.getElementById("mensagem");

    mensagem.textContent = texto;

    mensagem.classList.add("show");

    setTimeout(() => {
        mensagem.classList.remove("show");
    }, 2200);
}


function dinheiro(valor) {

    return Number(valor || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}


function escapar(texto) {

    return String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==================== MENU ====================

document.querySelectorAll(".menu-btn").forEach(botao => {

    botao.addEventListener("click", () => {

        document.querySelectorAll(".menu-btn")
            .forEach(b => b.classList.remove("active"));

        botao.classList.add("active");

        document.querySelectorAll(".section")
            .forEach(secao => secao.classList.remove("active"));

        const secao = document.getElementById(
            botao.dataset.section
        );

        secao.classList.add("active");

        document.getElementById("tituloPagina")
            .textContent = botao.textContent.trim();

        if (botao.dataset.section === "dashboard") {
            carregarResumo();
        }

        if (botao.dataset.section === "clientes") {
            carregarClientes();
        }

        if (botao.dataset.section === "servicos") {
            carregarServicos();
        }

        if (botao.dataset.section === "agendamentos") {
            carregarAgendamentos();
        }
    });

});


// ==================== DASHBOARD ====================

async function carregarResumo() {

    try {

        const dados = await api("/api/resumo");

        document.getElementById("totalClientes")
            .textContent = dados.clientes;

        document.getElementById("totalServicos")
            .textContent = dados.servicos;

        document.getElementById("totalAgendamentos")
            .textContent = dados.agendamentos;

    } catch (erro) {

        mostrarMensagem(erro.message);

    }
}


// ==================== CLIENTES ====================

async function carregarClientes() {

    try {

        clientes = await api("/api/clientes");

        const tabela =
            document.getElementById("clientesTabela");

        if (clientes.length === 0) {

            tabela.innerHTML = `
                <tr>
                    <td colspan="4">
                        Nenhum cliente cadastrado.
                    </td>
                </tr>
            `;

            return;
        }

        tabela.innerHTML = clientes.map(cliente => `

            <tr>

                <td>
                    ${escapar(cliente.nome)}
                </td>

                <td>
                    ${escapar(cliente.email)}
                </td>

                <td>
                    ${escapar(cliente.telefone)}
                </td>

                <td>

                    <div class="actions">

                        <button
                            class="small"
                            onclick="editarCliente(${cliente.id})">

                            Editar

                        </button>

                        <button
                            class="small delete"
                            onclick="excluirCliente(${cliente.id})">

                            Excluir

                        </button>

                    </div>

                </td>

            </tr>

        `).join("");

    } catch (erro) {

        mostrarMensagem(erro.message);

    }
}


function abrirCliente(cliente = null) {

    editandoCliente = cliente
        ? cliente.id
        : null;

    document.getElementById("modalTitulo")
        .textContent = cliente
            ? "Editar cliente"
            : "Novo cliente";


    document.getElementById("modalForm").innerHTML = `

        <div class="field">

            <label>
                Nome completo
            </label>

            <input
                id="clienteNome"
                required
                value="${escapar(cliente?.nome)}">

        </div>


        <div class="field">

            <label>
                E-mail
            </label>

            <input
                id="clienteEmail"
                type="email"
                required
                value="${escapar(cliente?.email)}">

        </div>


        <div class="field">

            <label>
                Telefone
            </label>

            <input
                id="clienteTelefone"
                value="${escapar(cliente?.telefone)}">

        </div>


        <div class="field">

            <label>
                Data de nascimento
            </label>

            <input
                id="clienteData"
                type="date"
                value="${escapar(cliente?.data_nascimento)}">

        </div>


        <div class="form-buttons">

            <button
                type="button"
                class="cancel"
                onclick="fecharModal()">

                Cancelar

            </button>

            <button
                type="submit"
                class="primary">

                Salvar

            </button>

        </div>

    `;


    document.getElementById("modalForm")
        .onsubmit = async function(evento) {

        evento.preventDefault();

        const dados = {

            nome: document.getElementById("clienteNome").value,

            email: document.getElementById("clienteEmail").value,

            telefone: document.getElementById("clienteTelefone").value,

            data_nascimento:
                document.getElementById("clienteData").value
        };


        try {

            if (editandoCliente) {

                await api(
                    `/api/clientes/${editandoCliente}`,
                    {
                        method: "PUT",
                        body: JSON.stringify(dados)
                    }
                );

                mostrarMensagem("Cliente atualizado!");

            } else {

                await api(
                    "/api/clientes",
                    {
                        method: "POST",
                        body: JSON.stringify(dados)
                    }
                );

                mostrarMensagem("Cliente cadastrado!");

            }


            fecharModal();

            carregarClientes();

            carregarResumo();


        } catch (erro) {

            mostrarMensagem(erro.message);

        }

    };


    abrirModal();
}


function editarCliente(id) {

    const cliente = clientes.find(
        cliente => cliente.id === id
    );

    abrirCliente(cliente);
}


async function excluirCliente(id) {

    if (!confirm("Deseja excluir este cliente?")) {
        return;
    }

    try {

        await api(
            `/api/clientes/${id}`,
            {
                method: "DELETE"
            }
        );

        mostrarMensagem("Cliente excluído!");

        carregarClientes();

        carregarResumo();

    } catch (erro) {

        mostrarMensagem(erro.message);

    }
}


// ==================== SERVIÇOS ====================

async function carregarServicos() {

    try {

        servicos = await api("/api/servicos");

        const tabela =
            document.getElementById("servicosTabela");


        if (servicos.length === 0) {

            tabela.innerHTML = `
                <tr>
                    <td colspan="4">
                        Nenhum serviço cadastrado.
                    </td>
                </tr>
            `;

            return;
        }


        tabela.innerHTML = servicos.map(servico => `

            <tr>

                <td>
                    ${escapar(servico.nome)}
                </td>

                <td>
                    ${escapar(servico.descricao)}
                </td>

                <td>
                    ${dinheiro(servico.preco)}
                </td>

                <td>

                    <div class="actions">

                        <button
                            class="small"
                            onclick="editarServico(${servico.id})">

                            Editar

                        </button>

                        <button
                            class="small delete"
                            onclick="excluirServico(${servico.id})">

                            Excluir

                        </button>

                    </div>

                </td>

            </tr>

        `).join("");


    } catch (erro) {

        mostrarMensagem(erro.message);

    }
}


function abrirServico(servico = null) {

    editandoServico = servico
        ? servico.id
        : null;


    document.getElementById("modalTitulo")
        .textContent = servico
            ? "Editar serviço"
            : "Novo serviço";


    document.getElementById("modalForm").innerHTML = `

        <div class="field">

            <label>
                Nome do serviço
            </label>

            <input
                id="servicoNome"
                required
                value="${escapar(servico?.nome)}">

        </div>


        <div class="field">

            <label>
                Descrição
            </label>

            <textarea
                id="servicoDescricao">${escapar(servico?.descricao)}</textarea>

        </div>


        <div class="field">

            <label>
                Preço
            </label>

            <input
                id="servicoPreco"
                type="number"
                step="0.01"
                min="0"
                required
                value="${servico?.preco ?? ""}">

        </div>


        <div class="form-buttons">

            <button
                type="button"
                class="cancel"
                onclick="fecharModal()">

                Cancelar

            </button>

            <button
                type="submit"
                class="primary">

                Salvar

            </button>

        </div>

    `;


    document.getElementById("modalForm")
        .onsubmit = async function(evento) {

        evento.preventDefault();


        const dados = {

            nome:
                document.getElementById("servicoNome").value,

            descricao:
                document.getElementById("servicoDescricao").value,

            preco:
                document.getElementById("servicoPreco").value

        };


        try {

            if (editandoServico) {

                await api(
                    `/api/servicos/${editandoServico}`,
                    {
                        method: "PUT",
                        body: JSON.stringify(dados)
                    }
                );

                mostrarMensagem("Serviço atualizado!");

            } else {

                await api(
                    "/api/servicos",
                    {
                        method: "POST",
                        body: JSON.stringify(dados)
                    }
                );

                mostrarMensagem("Serviço cadastrado!");

            }


            fecharModal();

            carregarServicos();

            carregarResumo();


        } catch (erro) {

            mostrarMensagem(erro.message);

        }

    };


    abrirModal();
}


function editarServico(id) {

    const servico = servicos.find(
        servico => servico.id === id
    );

    abrirServico(servico);
}


async function excluirServico(id) {

    if (!confirm("Deseja excluir este serviço?")) {
        return;
    }


    try {

        await api(
            `/api/servicos/${id}`,
            {
                method: "DELETE"
            }
        );

        mostrarMensagem("Serviço excluído!");

        carregarServicos();

        carregarResumo();


    } catch (erro) {

        mostrarMensagem(erro.message);

    }
}


// ==================== AGENDAMENTOS ====================

async function carregarAgendamentos() {

    try {

        agendamentos =
            await api("/api/agendamentos");


        const tabela =
            document.getElementById("agendamentosTabela");


        if (agendamentos.length === 0) {

            tabela.innerHTML = `
                <tr>
                    <td colspan="6">
                        Nenhum agendamento cadastrado.
                    </td>
                </tr>
            `;

            return;
        }


        tabela.innerHTML =
            agendamentos.map(agendamento => `

            <tr>

                <td>
                    ${escapar(agendamento.cliente_nome)}
                </td>

                <td>
                    ${escapar(agendamento.servico_nome)}
                </td>

                <td>
                    ${escapar(agendamento.data)}
                </td>

                <td>
                    ${escapar(agendamento.horario)}
                </td>

                <td>
                    ${escapar(agendamento.status)}
                </td>

                <td>

                    <div class="actions">

                        <button
                            class="small"
                            onclick="concluirAgendamento(${agendamento.id})">

                            Concluir

                        </button>

                        <button
                            class="small"
                            onclick="cancelarAgendamento(${agendamento.id})">

                            Cancelar

                        </button>

                        <button
                            class="small delete"
                            onclick="excluirAgendamento(${agendamento.id})">

                            Excluir

                        </button>

                    </div>

                </td>

            </tr>

        `).join("");


    } catch (erro) {

        mostrarMensagem(erro.message);

    }
}


function abrirAgendamento() {

    if (clientes.length === 0) {

        mostrarMensagem(
            "Cadastre um cliente primeiro."
        );

        return;
    }


    if (servicos.length === 0) {

        mostrarMensagem(
            "Cadastre um serviço primeiro."
        );

        return;
    }


    document.getElementById("modalTitulo")
        .textContent = "Novo agendamento";


    document.getElementById("modalForm").innerHTML = `

        <div class="field">

            <label>
                Cliente
            </label>

            <select id="agendamentoCliente">

                ${clientes.map(cliente => `

                    <option value="${cliente.id}">
                        ${escapar(cliente.nome)}
                    </option>

                `).join("")}

            </select>

        </div>


        <div class="field">

            <label>
                Serviço
            </label>

            <select id="agendamentoServico">

                ${servicos.map(servico => `

                    <option value="${servico.id}">
                        ${escapar(servico.nome)}
                    </option>

                `).join("")}

            </select>

        </div>


        <div class="field">

            <label>
                Data
            </label>

            <input
                id="agendamentoData"
                type="date"
                required>

        </div>


        <div class="field">

            <label>
                Horário
            </label>

            <input
                id="agendamentoHorario"
                type="time"
                required>

        </div>


        <div class="form-buttons">

            <button
                type="button"
                class="cancel"
                onclick="fecharModal()">

                Cancelar

            </button>

            <button
                type="submit"
                class="primary">

                Agendar

            </button>

        </div>

    `;


    document.getElementById("modalForm")
        .onsubmit = async function(evento) {

        evento.preventDefault();


        const dados = {

            cliente_id:
                document.getElementById(
                    "agendamentoCliente"
                ).value,

            servico_id:
                document.getElementById(
                    "agendamentoServico"
                ).value,

            data:
                document.getElementById(
                    "agendamentoData"
                ).value,

            horario:
                document.getElementById(
                    "agendamentoHorario"
                ).value

        };


        try {

            await api(
                "/api/agendamentos",
                {
                    method: "POST",
                    body: JSON.stringify(dados)
                }
            );


            fecharModal();

            mostrarMensagem(
                "Agendamento criado!"
            );

            carregarAgendamentos();

            carregarResumo();


        } catch (erro) {

            mostrarMensagem(erro.message);

        }

    };


    abrirModal();
}


async function alterarStatus(id, status) {

    try {

        await api(
            `/api/agendamentos/${id}`,
            {
                method: "PUT",
                body: JSON.stringify({
                    status: status
                })
            }
        );

        mostrarMensagem(
            "Status atualizado!"
        );

        carregarAgendamentos();

    } catch (erro) {

        mostrarMensagem(erro.message);

    }
}


function concluirAgendamento(id) {

    alterarStatus(
        id,
        "Concluído"
    );
}


function cancelarAgendamento(id) {

    alterarStatus(
        id,
        "Cancelado"
    );
}


async function excluirAgendamento(id) {

    if (!confirm(
        "Deseja excluir este agendamento?"
    )) {
        return;
    }


    try {

        await api(
            `/api/agendamentos/${id}`,
            {
                method: "DELETE"
            }
        );

        mostrarMensagem(
            "Agendamento excluído!"
        );

        carregarAgendamentos();

        carregarResumo();


    } catch (erro) {

        mostrarMensagem(erro.message);

    }
}


// ==================== MODAL ====================

function abrirModal() {

    document
        .getElementById("modal")
        .classList.add("show");
}


function fecharModal() {

    document
        .getElementById("modal")
        .classList.remove("show");
}


document.getElementById("modal")
    .addEventListener("click", function(evento) {

        if (evento.target.id === "modal") {
            fecharModal();
        }

    });


// ==================== INICIALIZAÇÃO ====================

async function iniciarSistema() {

    await carregarResumo();

    await carregarClientes();

    await carregarServicos();

    await carregarAgendamentos();

}


iniciarSistema();