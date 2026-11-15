const API_CLIENTES = "http://localhost:8080/api/clientes";
const API_SERVICOS = "http://localhost:8080/api/servicos";
const API_AULAS = "http://localhost:8080/api/aulas";
const API_AGENDAMENTOS = "http://localhost:8080/api/agendamentos";

const totalTratamentos = document.getElementById("totalTratamentos");
const totalAgendamentosAulas = document.getElementById("totalAgendamentosAulas");
const totalServicos = document.getElementById("totalServicos");

const tabelaUsuarios = document.getElementById("tabelaUsuarios");
const totalUsuarios = document.getElementById("totalUsuarios");
const pesquisaUsuario = document.getElementById("pesquisaUsuario");
const filtroStatus = document.getElementById("filtroStatus");
const semUsuarios = document.getElementById("semUsuarios");

const tabelaServicos = document.getElementById("tabelaServicos");
const semServicos = document.getElementById("semServicos");

const tabelaAulas = document.getElementById("tabelaAulas");
const semAulas = document.getElementById("semAulas");


const modalUsuario = document.getElementById("modalUsuario");
const conteudoModal = document.getElementById("conteudoModal");
const tituloModal = document.getElementById("tituloModal");

let usuarios = [];

const tabelaAgendamentos = document.getElementById("tabelaAgendamentos");
const semAgendamentos = document.getElementById("semAgendamentos");

let agendamentos = [];

/* NAVEGAÇÃO ENTRE AS SEÇÕES */
document.querySelectorAll(".item-menu-admin").forEach((botao) => {
    botao.addEventListener("click", () => {
        const secao = botao.dataset.secao;

        document.querySelectorAll(".item-menu-admin").forEach((item) => {
            item.classList.remove("ativo");
        });

        document.querySelectorAll(".secao-admin").forEach((item) => {
            item.classList.remove("ativa");
        });

        botao.classList.add("ativo");
        document.getElementById(`secao-${secao}`)?.classList.add("ativa");
    });
});

/* ABRIR E FECHAR MODAL */
function abrirModal(titulo, conteudo) {
    tituloModal.textContent = titulo;
    conteudoModal.innerHTML = conteudo;
    modalUsuario.hidden = false;
}

function fecharModal() {
    modalUsuario.hidden = true;
    conteudoModal.innerHTML = "";
}

document.getElementById("btnFecharModal").addEventListener("click", fecharModal);
document.getElementById("btnConfirmarModal").addEventListener("click", fecharModal);

modalUsuario.addEventListener("click", (event) => {
    if (event.target === modalUsuario) fecharModal();
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modalUsuario.hidden) fecharModal();
});

/* EVITA INSERIR TEXTO DO BACKEND COMO HTML */
function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, (caractere) => {
        const entidades = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entidades[caractere];
    });
}

/* MENSAGEM DE ERRO */
function mostrarErro(mensagem) {
    abrirModal(
        "Não foi possível concluir",
        `<p class="mensagem-erro">${escaparHTML(mensagem)}</p>`
    );
}

/* FORMATAÇÕES */
function formatarData(data) {
    if (!data) return "—";

    const dataValida = new Date(data);

    if (Number.isNaN(dataValida.getTime())) {
        return String(data);
    }

    return dataValida.toLocaleDateString("pt-BR");
}

function formatarHorario(horario) {
    if (!horario) return "—";
    return String(horario).slice(0, 5);
}

function formatarDiaSemana(dia) {
    const dias = {
        MONDAY: "Segunda-feira",
        TUESDAY: "Terça-feira",
        WEDNESDAY: "Quarta-feira",
        THURSDAY: "Quinta-feira",
        FRIDAY: "Sexta-feira",
        SATURDAY: "Sábado",
        SUNDAY: "Domingo"
    };

    return dias[String(dia).toUpperCase()] || dia || "—";
}

function formatarStatus(ativo) {
    return ativo === false ? "Inativo" : "Ativo";
}

/* CARREGAR USUÁRIOS DO BACKEND */
async function carregarUsuarios() {
    tabelaUsuarios.innerHTML = `
        <tr>
            <td colspan="5">Carregando usuários...</td>
        </tr>
    `;

    try {
        const resposta = await fetch(API_CLIENTES);

        if (!resposta.ok) {
            throw new Error("O servidor não conseguiu carregar os usuários.");
        }

        const dados = await resposta.json();

        usuarios = Array.isArray(dados)
            ? dados
            : Array.isArray(dados.content)
                ? dados.content
                : [];

        atualizarTabela();
    } catch (erro) {
        tabelaUsuarios.innerHTML = `
            <tr>
                <td colspan="5">Não foi possível carregar os usuários.</td>
            </tr>
        `;

        totalUsuarios.textContent = "—";
        semUsuarios.hidden = true;

        console.error("Erro ao carregar usuários:", erro);
    }
}

/* DESENHAR TABELA DE USUÁRIOS */
function atualizarTabela() {
    const termo = pesquisaUsuario.value.trim().toLowerCase();
    const statusSelecionado = filtroStatus.value;

    const filtrados = usuarios.filter((usuario) => {
        const nome = String(usuario.nome ?? "").toLowerCase();
        const email = String(usuario.email ?? "").toLowerCase();
        const status = String(usuario.status ?? "Ativo");

        const correspondePesquisa =
            nome.includes(termo) || email.includes(termo);

        const correspondeStatus =
            statusSelecionado === "todos" ||
            status.toLowerCase() === statusSelecionado.toLowerCase();

        return correspondePesquisa && correspondeStatus;
    });

    tabelaUsuarios.innerHTML = "";

    filtrados.forEach((usuario) => {
        const linha = document.createElement("tr");
        const status = usuario.status ?? "Ativo";
        const dataCadastro = usuario.criadoEm ?? usuario.dataCadastro;

        linha.innerHTML = `
            <td>${escaparHTML(usuario.nome || "—")}</td>
            <td>${escaparHTML(usuario.email || "—")}</td>
            <td>${escaparHTML(formatarData(dataCadastro))}</td>
            <td>
                <span class="status-usuario">
                    ${escaparHTML(status)}
                </span>
            </td>
            <td>
                <button
                    class="botao-detalhes"
                    type="button"
                    data-usuario-id="${escaparHTML(usuario.id)}"
                >
                    Ver detalhes
                </button>
            </td>
        `;

        tabelaUsuarios.appendChild(linha);
    });

    totalUsuarios.textContent = usuarios.length;
    semUsuarios.hidden = filtrados.length > 0;

    if (filtrados.length === 0) {
        tabelaUsuarios.innerHTML = `
            <tr>
                <td colspan="5">Nenhum usuário encontrado.</td>
            </tr>
        `;
    }
}

/* PESQUISA E FILTRO DE USUÁRIOS */
pesquisaUsuario.addEventListener("input", atualizarTabela);
filtroStatus.addEventListener("change", atualizarTabela);

/* DETALHES DO USUÁRIO */
tabelaUsuarios.addEventListener("click", (event) => {
    const botao = event.target.closest("[data-usuario-id]");
    if (!botao) return;

    const usuario = usuarios.find(
        (item) => String(item.id) === botao.dataset.usuarioId
    );

    if (!usuario) return;

    abrirModal(
        "Detalhes do usuário",
        `
            <div class="detalhes-usuario">
                <p><strong>Nome:</strong> ${escaparHTML(usuario.nome || "—")}</p>
                <p><strong>E-mail:</strong> ${escaparHTML(usuario.email || "—")}</p>
                <p><strong>Telefone:</strong> ${escaparHTML(usuario.telefone || "—")}</p>
                <p><strong>Status:</strong> ${escaparHTML(usuario.status || "Ativo")}</p>
                <p><strong>Cadastro:</strong> ${escaparHTML(
                    formatarData(usuario.criadoEm ?? usuario.dataCadastro)
                )}</p>
            </div>
        `
    );
});

/* FORMULÁRIO DE NOVO USUÁRIO */
document.getElementById("btnNovoUsuario").addEventListener("click", () => {
    abrirModal(
        "Novo usuário",
        `
            <form id="formNovoUsuario" class="form-novo-usuario">
                <label for="novoNome">Nome</label>
                <input id="novoNome" name="nome" type="text" required>

                <label for="novoEmail">E-mail</label>
                <input id="novoEmail" name="email" type="email" required>

                <label for="novoTelefone">Telefone</label>
                <input id="novoTelefone" name="telefone" type="tel">

                <label for="novaSenha">Senha</label>
                <input id="novaSenha" name="senha" type="password" required minlength="6">

                <p id="erroNovoUsuario" class="mensagem-erro" role="alert"></p>

                <button class="botao-principal" type="submit">
                    Cadastrar usuário
                </button>
            </form>
        `
    );

    document.getElementById("formNovoUsuario")
        .addEventListener("submit", cadastrarUsuario);
});

/* ENVIAR NOVO USUÁRIO PARA O BACKEND */
async function cadastrarUsuario(event) {
    event.preventDefault();

    const formulario = event.currentTarget;
    const erro = document.getElementById("erroNovoUsuario");
    const botaoEnviar = formulario.querySelector('button[type="submit"]');

    const novoUsuario = {
        nome: formulario.nome.value.trim(),
        email: formulario.email.value.trim(),
        telefone: formulario.telefone.value.trim(),
        senha: formulario.senha.value
    };

    erro.textContent = "";

    if (!novoUsuario.nome || !novoUsuario.email || !novoUsuario.senha) {
        erro.textContent = "Preencha nome, e-mail e senha.";
        return;
    }

    botaoEnviar.disabled = true;
    botaoEnviar.textContent = "Cadastrando...";

    try {
        const resposta = await fetch(API_CLIENTES, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(novoUsuario)
        });

        const resultado = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            throw new Error(
                resultado.mensagem ||
                resultado.message ||
                "Não foi possível cadastrar o usuário."
            );
        }

        fecharModal();
        await carregarUsuarios();

        abrirModal(
            "Cadastro concluído",
            "<p>O usuário foi cadastrado com sucesso.</p>"
        );
    } catch (erroCadastro) {
        erro.textContent = erroCadastro.message ||
            "Não foi possível conectar ao servidor.";
    } finally {
        botaoEnviar.disabled = false;
        botaoEnviar.textContent = "Cadastrar usuário";
    }
}

/* CARREGAR SERVIÇOS DO BACKEND */
async function carregarServicos() {
    tabelaServicos.innerHTML = `
        <tr>
            <td colspan="5">Carregando serviços...</td>
        </tr>
    `;

    try {
        const resposta = await fetch(API_SERVICOS);

        if (!resposta.ok) {
            throw new Error("O servidor não conseguiu carregar os serviços.");
        }

        const dados = await resposta.json();
        const servicos = Array.isArray(dados)
            ? dados
            : Array.isArray(dados.content)
                ? dados.content
                : [];

        tabelaServicos.innerHTML = "";
        if (totalServicos) {
            totalServicos.textContent = servicos.length;
        }

        servicos.forEach((servico) => {
            const linha = document.createElement("tr");

            linha.innerHTML = `
                <td>${escaparHTML(servico.nome || "—")}</td>
                <td>${escaparHTML(servico.categoria || "—")}</td>
                <td>${escaparHTML(servico.duracaoMinutos ?? "—")} min</td>
                <td>${escaparHTML(servico.sessoesPorMes ?? "—")}</td>
                <td>${escaparHTML(formatarStatus(servico.ativo))}</td>
            `;

            tabelaServicos.appendChild(linha);
        });

        semServicos.hidden = servicos.length > 0;

        if (servicos.length === 0) {
            tabelaServicos.innerHTML = `
                <tr>
                    <td colspan="5">Nenhum serviço cadastrado.</td>
                </tr>
            `;
        }
    } catch (erro) {
        tabelaServicos.innerHTML = `
            <tr>
                <td colspan="5">Não foi possível carregar os serviços.</td>
            </tr>
        `;
        semServicos.hidden = true;
        console.error("Erro ao carregar serviços:", erro);
    }
}

/* CARREGAR AULAS DO BACKEND */
async function carregarAulas() {
    tabelaAulas.innerHTML = `
        <tr>
            <td colspan="5">Carregando aulas...</td>
        </tr>
    `;

    try {
        const resposta = await fetch(API_AULAS);

        if (!resposta.ok) {
            throw new Error("O servidor não conseguiu carregar as aulas.");
        }

        const dados = await resposta.json();
        const aulas = Array.isArray(dados)
            ? dados
            : Array.isArray(dados.content)
                ? dados.content
                : [];

        tabelaAulas.innerHTML = "";

        aulas.forEach((aula) => {
            const linha = document.createElement("tr");
            const horario = `${formatarHorario(aula.horarioInicio)} às ${formatarHorario(aula.horarioFim)}`;

            linha.innerHTML = `
                <td>${escaparHTML(aula.nome || "—")}</td>
                <td>${escaparHTML(formatarDiaSemana(aula.diaSemana))}</td>
                <td>${escaparHTML(horario)}</td>
                <td>${escaparHTML(aula.vagas ?? "—")}</td>
                <td>${escaparHTML(formatarStatus(aula.ativo))}</td>
            `;

            tabelaAulas.appendChild(linha);
        });

        totalAulas.textContent = aulas.length;
        semAulas.hidden = aulas.length > 0;

        if (aulas.length === 0) {
            tabelaAulas.innerHTML = `
                <tr>
                    <td colspan="5">Nenhuma aula cadastrada.</td>
                </tr>
            `;
        }
    } catch (erro) {
        tabelaAulas.innerHTML = `
            <tr>
                <td colspan="5">Não foi possível carregar as aulas.</td>
            </tr>
        `;
        semAulas.hidden = true;
        totalAulas.textContent = "—";
        console.error("Erro ao carregar aulas:", erro);
    }
}

/* INICIALIZAÇÃO */
carregarUsuarios();
carregarServicos();
carregarAgendamentos();

/* =========================================
   AGENDAMENTOS — BUSCAR DADOS DO MYSQL
========================================= */

function formatarDataAgendamento(data) {
    if (!data) return "—";

    // Evita alteração do dia por diferença de fuso horário.
    const partes = String(data).split("-");

    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    return data;
}

function formatarTipoAgendamento(tipo) {
    const tipos = {
        AULA: "Aula",
        TRATAMENTO: "Tratamento"
    };

    return tipos[String(tipo || "").toUpperCase()] || tipo || "—";
}

async function carregarAgendamentos() {
    if (!tabelaAgendamentos) return;

    tabelaAgendamentos.innerHTML = `
        <tr>
            <td colspan="9">Carregando agendamentos...</td>
        </tr>
    `;

    try {
        const resposta = await fetch(API_AGENDAMENTOS);

        if (!resposta.ok) {
            throw new Error("Não foi possível buscar os agendamentos.");
        }

        const dados = await resposta.json();

        agendamentos = Array.isArray(dados)
            ? dados
            : Array.isArray(dados.content)
                ? dados.content
                : [];

        renderizarAgendamentos();

    } catch (erro) {
        console.error("Erro ao carregar agendamentos:", erro);

        tabelaAgendamentos.innerHTML = `
            <tr>
                <td colspan="9">
                    Não foi possível carregar os agendamentos.
                    Verifique se o servidor está funcionando.
                </td>
            </tr>
        `;

        semAgendamentos.hidden = true;
    }
}

/* =========================================
   EXIBIR AGENDAMENTOS NA TABELA
========================================= */

function renderizarAgendamentos() {
    if (!tabelaAgendamentos || !tabelaAulas) return;

    tabelaAgendamentos.innerHTML = "";
    tabelaAulas.innerHTML = "";

    const tratamentos = agendamentos.filter(
        item => String(item.tipo || "").toUpperCase() === "TRATAMENTO"
    );

    const aulasAgendadas = agendamentos.filter(
        item => String(item.tipo || "").toUpperCase() === "AULA"
    );

    // Atualiza os cartões do painel com os dados do banco.
    if (totalTratamentos) {
        totalTratamentos.textContent = tratamentos.length;
    }

    if (totalAgendamentosAulas) {
        totalAgendamentosAulas.textContent = aulasAgendadas.length;
    }

    function obterMinutos(horario) {
        const resultado = String(horario || "").match(/\d{1,2}:\d{2}/);

        if (!resultado) return 0;

        const [hora, minuto] = resultado[0].split(":").map(Number);

        return hora * 60 + minuto;
    }

    function obterData(data) {
        if (!data) return Number.MAX_SAFE_INTEGER;

        const partes = String(data).split("-");

        if (partes.length !== 3) {
            return Number.MAX_SAFE_INTEGER;
        }

        const [ano, mes, dia] = partes.map(Number);

        return new Date(ano, mes - 1, dia).getTime();
    }

    const ordemDias = {
        MONDAY: 1,
        TUESDAY: 2,
        WEDNESDAY: 3,
        THURSDAY: 4,
        FRIDAY: 5,
        SATURDAY: 6,
        SUNDAY: 7
    };

    // Ordena tratamentos por data e horário.
    tratamentos.sort((a, b) => {
        const diferenca = obterData(a.data) - obterData(b.data);

        return diferenca !== 0
            ? diferenca
            : obterMinutos(a.horario) - obterMinutos(b.horario);
    });

    // Ordena aulas por dia da semana e horário.
    aulasAgendadas.sort((a, b) => {
        const diaA = ordemDias[String(a.diaSemana || "").toUpperCase()] || 8;
        const diaB = ordemDias[String(b.diaSemana || "").toUpperCase()] || 8;

        if (diaA !== diaB) return diaA - diaB;

        return obterMinutos(a.horario) - obterMinutos(b.horario);
    });

    function criarAcoes(agendamento) {
        const statusAtual = agendamento.status || "Confirmado";

        return `
            <div class="acoes-agendamento">
                <select
                    class="select-status-agendamento"
                    data-agendamento-status="${escaparHTML(agendamento.id)}"
                    aria-label="Novo status do agendamento"
                >
                    <option value="Pendente" ${statusAtual === "Pendente" ? "selected" : ""}>
                        Pendente
                    </option>

                    <option value="Confirmado" ${statusAtual === "Confirmado" ? "selected" : ""}>
                        Confirmado
                    </option>

                    <option value="Concluído" ${statusAtual === "Concluído" ? "selected" : ""}>
                        Concluído
                    </option>

                    <option value="Cancelado" ${statusAtual === "Cancelado" ? "selected" : ""}>
                        Cancelado
                    </option>
                </select>

                <button
                    type="button"
                    class="botao-detalhes"
                    data-salvar-status="${escaparHTML(agendamento.id)}"
                >
                    Salvar
                </button>
            </div>
        `;
    }

    // TABELA DE TRATAMENTOS
    tratamentos.forEach(agendamento => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${escaparHTML(agendamento.clienteNome || "—")}</td>
            <td class="coluna-email">${escaparHTML(agendamento.clienteEmail || "—")}</td>
            <td>${escaparHTML(agendamento.nomeItem || "—")}</td>
            <td>${escaparHTML(formatarDataAgendamento(agendamento.data))}</td>
            <td>${escaparHTML(agendamento.horario || "—")}</td>
            <td>${escaparHTML(agendamento.profissional || "—")}</td>
            <td>
                <span class="status-usuario">
                    ${escaparHTML(agendamento.status || "Confirmado")}
                </span>
            </td>
            <td>${criarAcoes(agendamento)}</td>
        `;

        tabelaAgendamentos.appendChild(linha);
    });

    // TABELA DE AULAS AGENDADAS
    aulasAgendadas.forEach(agendamento => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${escaparHTML(agendamento.clienteNome || "—")}</td>
            <td class="coluna-email">${escaparHTML(agendamento.clienteEmail || "—")}</td>
            <td>${escaparHTML(agendamento.nomeItem || "—")}</td>
            <td>${escaparHTML(formatarDiaSemana(agendamento.diaSemana))}</td>
            <td>${escaparHTML(agendamento.horario || "—")}</td>
            <td>
                <span class="status-usuario">
                    ${escaparHTML(agendamento.status || "Confirmado")}
                </span>
            </td>
            <td>${criarAcoes(agendamento)}</td>
        `;

        tabelaAulas.appendChild(linha);
    });

    semAgendamentos.hidden = tratamentos.length > 0;
    semAulas.hidden = aulasAgendadas.length > 0;

    if (tratamentos.length === 0) {
        tabelaAgendamentos.innerHTML = `
            <tr>
                <td colspan="8">Nenhum tratamento agendado.</td>
            </tr>
        `;
    }

    if (aulasAgendadas.length === 0) {
        tabelaAulas.innerHTML = `
            <tr>
                <td colspan="7">Nenhuma aula agendada.</td>
            </tr>
        `;
    }
}

/* =========================================
   ATUALIZAR STATUS DO AGENDAMENTO
========================================= */

async function atualizarStatusAgendamento(evento) {
    const botao = evento.target.closest("[data-salvar-status]");

    if (!botao) return;

    const id = botao.dataset.salvarStatus;

    const seletor = document.querySelector(
        `[data-agendamento-status="${id}"]`
    );

    if (!seletor) return;

    const novoStatus = seletor.value;

    botao.disabled = true;
    botao.textContent = "Salvando...";

    try {
        const resposta = await fetch(`${API_AGENDAMENTOS}/${id}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                status: novoStatus
            })
        });

        if (!resposta.ok) {
            const erro = await resposta.json().catch(() => ({}));

            throw new Error(
                erro.mensagem ||
                erro.message ||
                "Não foi possível atualizar o status."
            );
        }

        alert("Status atualizado com sucesso!");

        await carregarAgendamentos();

    } catch (erro) {
        console.error("Erro ao atualizar status:", erro);
        mostrarErro(erro.message || "Erro ao atualizar o agendamento.");

    } finally {
        botao.disabled = false;
        botao.textContent = "Salvar";
    }
}

tabelaAgendamentos?.addEventListener("click", atualizarStatusAgendamento);
tabelaAulas?.addEventListener("click", atualizarStatusAgendamento);

/* =========================================
   INICIALIZAÇÃO DOS AGENDAMENTOS
========================================= */

carregarUsuarios();
carregarServicos();

/* =========================
   SOLICITAÇÕES DE PLANOS
   Mantém as funções originais do painel.
========================= */

const API_SOLICITACOES_PLANOS = "http://localhost:8080/api/solicitacoes-planos/admin";
const tabelaSolicitacoesPlanos = document.getElementById("tabelaSolicitacoesPlanos");
const semSolicitacoesPlanos = document.getElementById("semSolicitacoesPlanos");

// Carrega os pedidos quando a área de solicitações for aberta.
document.querySelector('[data-secao="planos"]')?.addEventListener("click", carregarSolicitacoesPlanos);

async function carregarSolicitacoesPlanos() {
    if (!tabelaSolicitacoesPlanos) return;

    tabelaSolicitacoesPlanos.innerHTML = `
        <tr><td colspan="7">Carregando solicitações...</td></tr>
    `;

    try {
        const resposta = await fetch(`${API_SOLICITACOES_PLANOS}/pendentes`);

        if (!resposta.ok) {
            throw new Error("Não foi possível buscar as solicitações de planos.");
        }

        const solicitacoes = await resposta.json();

        if (!Array.isArray(solicitacoes) || solicitacoes.length === 0) {
            tabelaSolicitacoesPlanos.innerHTML = "";
            if (semSolicitacoesPlanos) semSolicitacoesPlanos.hidden = false;
            return;
        }

        if (semSolicitacoesPlanos) semSolicitacoesPlanos.hidden = true;

        tabelaSolicitacoesPlanos.innerHTML = solicitacoes.map((solicitacao) => {
            const id = Number(solicitacao.id);
            const cliente = solicitacao.cliente?.nome || solicitacao.nomeCliente || "Não informado";
            const email = solicitacao.cliente?.email || solicitacao.email || "Não informado";
            const plano = solicitacao.plano?.nome || solicitacao.nomePlano || "Não informado";
            const valorNumero = Number(solicitacao.valor ?? solicitacao.plano?.valor ?? 0);
            const valor = valorNumero.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });

            const comprovante = solicitacao.comprovante;

            const pagamento = comprovante === "PIX_SIMULADO"
                ? "Pagamento demonstrativo confirmado"
                : (comprovante ? "Comprovante enviado" : "Aguardando pagamento");

            const data = formatarData(solicitacao.dataSolicitacao);

            return `
                <tr>
                    <td>${escaparHTML(cliente)}</td>
                    <td>${escaparHTML(email)}</td>
                    <td>${escaparHTML(plano)}</td>
                    <td>${escaparHTML(valor)}</td>
                    <td>${escaparHTML(pagamento)}</td>
                    <td>${escaparHTML(data)}</td>
                    <td>
                        <div class="acoes-solicitacao">
                            <button
                                class="acao-tabela"
                                type="button"
                                data-acao-plano="aprovar"
                                data-id="${id}">
                                Aprovar
                            </button>

                            <button
                                class="acao-tabela acao-rejeitar"
                                type="button"
                                data-acao-plano="rejeitar"
                                data-id="${id}">
                                Rejeitar
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

    } catch (erro) {
        console.error("Erro ao carregar solicitações de planos:", erro);

        tabelaSolicitacoesPlanos.innerHTML = `
            <tr>
                <td colspan="7">
                    ${escaparHTML(erro.message || "Erro ao carregar solicitações.")}
                </td>
            </tr>
        `;

        if (semSolicitacoesPlanos) semSolicitacoesPlanos.hidden = true;
    }
}

// Eventos dos botões de aprovação e rejeição.
tabelaSolicitacoesPlanos?.addEventListener("click", async (evento) => {
    const botao = evento.target.closest("button[data-acao-plano]");
    if (!botao) return;

    const id = Number(botao.dataset.id);
    const acao = botao.dataset.acaoPlano;

    if (!Number.isInteger(id) || id <= 0) return;

    if (acao === "aprovar") {
        await aprovarSolicitacaoPlano(id);
    } else if (acao === "rejeitar") {
        await rejeitarSolicitacaoPlano(id);
    }
});

async function aprovarSolicitacaoPlano(id) {
    if (!confirm("Deseja aprovar esta solicitação de plano?")) return;

    try {
        const resposta = await fetch(`${API_SOLICITACOES_PLANOS}/${id}/aprovar`, {
            method: "PUT"
        });

        if (!resposta.ok) {
            const mensagem = await resposta.text();
            throw new Error(mensagem || "Não foi possível aprovar a solicitação.");
        }

        alert("Solicitação aprovada com sucesso!");
        await carregarSolicitacoesPlanos();

    } catch (erro) {
        console.error("Erro ao aprovar solicitação:", erro);
        mostrarErro(erro.message || "Não foi possível aprovar a solicitação.");
    }
}

async function rejeitarSolicitacaoPlano(id) {
    const motivo = prompt("Informe o motivo da rejeição:");

    if (motivo === null) return;

    if (!motivo.trim()) {
        alert("Informe um motivo para rejeitar a solicitação.");
        return;
    }

    try {
        const resposta = await fetch(`${API_SOLICITACOES_PLANOS}/${id}/rejeitar`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                motivo: motivo.trim()
            })
        });

        if (!resposta.ok) {
            const mensagem = await resposta.text();
            throw new Error(mensagem || "Não foi possível rejeitar a solicitação.");
        }

        alert("Solicitação rejeitada.");
        await carregarSolicitacoesPlanos();

    } catch (erro) {
        console.error("Erro ao rejeitar solicitação:", erro);
        mostrarErro(erro.message || "Não foi possível rejeitar a solicitação.");
    }
}