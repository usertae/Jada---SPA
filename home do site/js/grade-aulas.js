const CHAVE_INSCRICOES = "jadeSpaInscricoesAulas";
const CHAVE_PERFIL = "jadeSpaPerfil";
const API_NOTIFICACOES = "http://localhost:8080/api/notificacoes";
const LIMITE_VAGAS = 10;
const API_AGENDAMENTOS = "http://localhost:8080/api/agendamentos";

const programacao = {
    "Yoga": [
        { dia: "Segunda-feira", horario: "08:00 às 09:00" },
        { dia: "Segunda-feira", horario: "18:00 às 19:00" },
        { dia: "Quarta-feira", horario: "08:00 às 09:00" },
        { dia: "Quarta-feira", horario: "18:00 às 19:00" }
    ],
    "Pilates": [
        { dia: "Quarta-feira", horario: "09:00 às 10:00" },
        { dia: "Quarta-feira", horario: "17:00 às 18:00" },
        { dia: "Sexta-feira", horario: "09:00 às 10:00" },
        { dia: "Sexta-feira", horario: "17:00 às 18:00" }
    ],
    "Cerâmica Fria": [
        { dia: "Sexta-feira", horario: "14:00 às 16:00" },
        { dia: "Sexta-feira", horario: "16:00 às 18:00" },
        { dia: "Sábado", horario: "09:00 às 11:00" },
        { dia: "Sábado", horario: "14:00 às 16:00" }
    ]
};

/* =========================================
   INSCRIÇÕES NAS AULAS
========================================= */

const modal = document.getElementById("modalInscricao");
const horariosDisponiveis = document.getElementById("horariosDisponiveis");
const form = document.getElementById("formInscricao");

let inscricoes = carregarInscricoes();
let aulaAtual = "";
let horarioAtual = null;

function carregarInscricoes() {
    try {
        const dados = JSON.parse(
            localStorage.getItem(CHAVE_INSCRICOES) || "[]"
        );
        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

function salvarInscricoes() {
    try {
        localStorage.setItem(
            CHAVE_INSCRICOES,
            JSON.stringify(inscricoes)
        );
        return true;
    } catch {
        alert("Não foi possível salvar a inscrição neste navegador.");
        return false;
    }
}

function vagasOcupadas(aula, dia, horario) {
    return inscricoes.filter(inscricao =>
        inscricao.aula === aula &&
        inscricao.dia === dia &&
        inscricao.horario === horario &&
        inscricao.status !== "Cancelado"
    ).length;
}

function abrirAula(nome) {
    aulaAtual = nome;
    horarioAtual = null;

    document.getElementById("aulaEscolhida").value = nome;
    document.getElementById("tituloModal").textContent = nome;
    document.getElementById("descricaoModal").textContent =
        "Escolha o dia e o horário para realizar sua inscrição.";

    document.getElementById("btnConfirmar").disabled = true;

    document.getElementById("mensagemVagas").textContent =
        "Selecione um horário para continuar.";
    document.getElementById("mensagemVagas").className = "mensagem-vagas";

    renderizarHorarios();
    renderizarMinhasInscricoes();

    modal.hidden = false;
    document.body.style.overflow = "hidden";
}

function fecharModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    form.reset();
    horarioAtual = null;
}

function renderizarHorarios() {
    horariosDisponiveis.replaceChildren();

    const lista = document.createElement("div");
    lista.className = "horarios-lista";

    programacao[aulaAtual].forEach(opcao => {
        const ocupadas = vagasOcupadas(
            aulaAtual,
            opcao.dia,
            opcao.horario
        );

        const restantes = Math.max(0, LIMITE_VAGAS - ocupadas);
        const lotada = restantes === 0;

        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "opcao-horario";

        if (
            horarioAtual &&
            horarioAtual.dia === opcao.dia &&
            horarioAtual.horario === opcao.horario
        ) {
            botao.classList.add("selecionado");
        }

        botao.disabled = lotada;

        const info = document.createElement("span");
        info.className = "horario-info";

        const dia = document.createElement("strong");
        dia.textContent = opcao.dia;

        const horario = document.createElement("small");
        horario.textContent = opcao.horario;

        info.append(dia, horario);

        const status = document.createElement("span");
        status.className = "status-vaga";

        if (lotada) {
            status.textContent = "Turma lotada";
            status.classList.add("lotada");
        } else {
            status.textContent = `${restantes} vaga(s)`;
        }

        botao.append(info, status);

        botao.addEventListener("click", () => {
            horarioAtual = opcao;

            document.getElementById("diaEscolhido").value = opcao.dia;
            document.getElementById("horarioEscolhido").value =
                opcao.horario;

            document.getElementById("btnConfirmar").disabled = false;

            const mensagem = document.getElementById("mensagemVagas");
            mensagem.className = "mensagem-vagas";
            mensagem.textContent =
                `${restantes} vaga(s) disponível(is) neste horário.`;

            renderizarHorarios();
        });

        lista.appendChild(botao);
    });

    horariosDisponiveis.appendChild(lista);
}

/* =========================================
   CADASTRAR INSCRIÇÃO NO MYSQL
========================================= */

form.addEventListener("submit", async evento => {
    evento.preventDefault();

    if (!horarioAtual) {
        alert("Selecione um dia e horário.");
        return;
    }

    const nome = document.getElementById("nomeAluno").value.trim();

    const email = document.getElementById("emailAluno")
        .value.trim().toLowerCase();

    if (!nome || !email) {
        alert("Preencha seu nome e e-mail.");
        return;
    }

    inscricoes = carregarInscricoes();

    const duplicada = inscricoes.some(inscricao =>
        inscricao.aula === aulaAtual &&
        inscricao.dia === horarioAtual.dia &&
        inscricao.horario === horarioAtual.horario &&
        inscricao.email.toLowerCase() === email &&
        inscricao.status !== "Cancelado"
    );

    if (duplicada) {
        alert("Esse e-mail já está inscrito neste horário.");
        return;
    }

    const botaoConfirmar = document.getElementById("btnConfirmar");

    botaoConfirmar.disabled = true;
    botaoConfirmar.textContent = "Salvando...";

    try {
        const dados = {
            tipo: "AULA",
            clienteNome: nome,
            clienteEmail: email,
            nomeItem: aulaAtual,
            diaSemana: horarioAtual.dia,
            horario: horarioAtual.horario,
            profissional: "A definir"
        };

        const resposta = await fetch(API_AGENDAMENTOS, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            throw new Error(
                resultado.mensagem ||
                resultado.message ||
                "Não foi possível realizar a inscrição. Verifique as vagas disponíveis."
            );
        }

        const novaInscricao = {
            id: resultado.id ?? gerarId(),
            agendamentoId: resultado.id ?? null,
            aula: aulaAtual,
            dia: horarioAtual.dia,
            horario: horarioAtual.horario,
            nome: nome,
            email: email,
            status: resultado.status || "Confirmado"
        };

        inscricoes.push(novaInscricao);

        if (!salvarInscricoes()) {
            console.error(
                "Inscrição salva no banco, mas a cópia local não foi salva."
            );
        }

        alert("Inscrição realizada e salva com sucesso!");

        horarioAtual = null;
        botaoConfirmar.disabled = true;

        document.getElementById("mensagemVagas").textContent =
            "Inscrição confirmada!";

        renderizarHorarios();
        renderizarMinhasInscricoes();

    } catch (erro) {
        console.error("Erro ao salvar inscrição:", erro);

        alert(
            erro.message ||
            "Erro ao conectar com o servidor."
        );

    } finally {
        botaoConfirmar.disabled = !horarioAtual;
        botaoConfirmar.textContent = "Confirmar Inscrição";
    }
});

/* =========================================
   MINHAS INSCRIÇÕES
========================================= */

function renderizarMinhasInscricoes() {
    const lista = document.getElementById("listaInscricoes");

    if (!lista) return;

    lista.replaceChildren();

    const email = document.getElementById("emailAluno")
        .value.trim().toLowerCase();

    const minhas = email
        ? inscricoes.filter(inscricao =>
            inscricao.email.toLowerCase() === email &&
            inscricao.status !== "Cancelado"
        )
        : [];

    if (minhas.length === 0) {
        const texto = document.createElement("p");

        texto.className = "sem-inscricoes";

        texto.textContent =
            "Digite seu e-mail para consultar suas inscrições neste navegador.";

        lista.appendChild(texto);
        return;
    }

    minhas.forEach(inscricao => {
        const item = document.createElement("div");
        item.className = "inscricao-item";

        const titulo = document.createElement("strong");
        titulo.textContent = inscricao.aula;

        const detalhes = document.createElement("p");
        detalhes.textContent =
            `${inscricao.dia} • ${inscricao.horario}`;

        const cancelar = document.createElement("button");

        cancelar.type = "button";
        cancelar.className = "btn-cancelar-inscricao";
        cancelar.textContent = "Cancelar inscrição";

        cancelar.addEventListener("click", async () => {
            if (!confirm("Deseja cancelar esta inscrição?")) {
                return;
            }

            cancelar.disabled = true;
            cancelar.textContent = "Cancelando...";

            try {
                if (
                    inscricao.agendamentoId ||
                    typeof inscricao.id === "number"
                ) {
                    const idBanco =
                        inscricao.agendamentoId || inscricao.id;

                    const resposta = await fetch(
                        `${API_AGENDAMENTOS}/${idBanco}/status`,
                        {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                status: "Cancelado"
                            })
                        }
                    );

                    const resultado = await resposta.json().catch(() => ({}));

                    if (!resposta.ok) {
                        throw new Error(
                            resultado.mensagem ||
                            resultado.message ||
                            "Não foi possível cancelar a inscrição no servidor."
                        );
                    }
                }

                inscricoes = carregarInscricoes();

                inscricoes = inscricoes.map(item =>
                    item.id === inscricao.id
                        ? {
                            ...item,
                            status: "Cancelado"
                        }
                        : item
                );

                salvarInscricoes();

                renderizarHorarios();
                renderizarMinhasInscricoes();

                alert("Inscrição cancelada com sucesso!");

            } catch (erro) {
                console.error("Erro ao cancelar inscrição:", erro);

                alert(
                    erro.message ||
                    "Não foi possível cancelar a inscrição."
                );

                cancelar.disabled = false;
                cancelar.textContent = "Cancelar inscrição";
            }
        });

        item.append(titulo, detalhes, cancelar);

        lista.appendChild(item);
    });
}

/* =========================================
   GERAR ID LOCAL
========================================= */

function gerarId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/* =========================================
   ABRIR E FECHAR MODAL
========================================= */

document.querySelectorAll(".btn-inscrever").forEach(botao => {
    botao.addEventListener("click", () => {
        abrirAula(botao.dataset.aula);
    });
});

const fecharModalBotao = document.getElementById("fecharModal");

if (fecharModalBotao) {
    fecharModalBotao.addEventListener("click", fecharModal);
}

if (modal) {
    modal.addEventListener("click", evento => {
        if (evento.target === modal) {
            fecharModal();
        }
    });
}

document.addEventListener("keydown", evento => {
    if (evento.key === "Escape" && modal && !modal.hidden) {
        fecharModal();
    }
});

const campoEmail = document.getElementById("emailAluno");

if (campoEmail) {
    campoEmail.addEventListener(
        "input",
        renderizarMinhasInscricoes
    );
}

/* =========================================
   PERFIL — INICIAIS DO AVATAR
========================================= */

function atualizarAvatarMini() {
    try {
        const perfil = JSON.parse(
            localStorage.getItem(CHAVE_PERFIL) || "{}"
        );

        const avatarMini = document.querySelector(".avatar-mini");

        if (!avatarMini || !perfil.nome) return;

        const partes = perfil.nome
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        if (partes.length === 0) return;

        const iniciais = partes.length > 2
            ? partes[0][0] + partes[partes.length - 1][0]
            : partes[0][0];

        avatarMini.textContent = iniciais.toUpperCase();

    } catch (erro) {
        console.error("Não foi possível carregar o perfil.", erro);
    }
}
   
/* =========================================
   NOTIFICAÇÕES — INTEGRADAS AO MYSQL
========================================= */

function configurarNotificacoes() {
    const botao = document.getElementById("btnNotificacoes");
    const painel = document.getElementById("painelNotificacoes");
    const lista = document.getElementById("listaNotificacoes");
    const contador = document.getElementById("notificacaoContador");
    const ponto = document.getElementById("notificacaoPonto");
    const vazio = document.getElementById("notificacoesVazio");
    const marcarTodas = document.getElementById("marcarTodasLidas");

    if (!botao || !painel || !lista) {
        console.error("Elementos de notificações não encontrados.");
        return;
    }

    let notificacoes = [];

    function obterEmailCliente() {
        try {
            const perfil = JSON.parse(
                localStorage.getItem(CHAVE_PERFIL) || "null"
            );

            return perfil?.email?.trim().toLowerCase() || null;
        } catch (erro) {
            console.error("Erro ao obter e-mail do cliente:", erro);
            return null;
        }
    }

    function formatarData(data) {
        if (!data) return "";

        const dataConvertida = new Date(data);

        if (Number.isNaN(dataConvertida.getTime())) {
            return "";
        }

        return dataConvertida.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function renderizarNotificacoes() {
        lista.replaceChildren();

        const naoLidas = notificacoes.filter(
            notificacao => !notificacao.lida
        ).length;

        contador.textContent = naoLidas;
        contador.hidden = naoLidas === 0;

        if (ponto) {
            ponto.hidden = naoLidas === 0;
        }

        if (vazio) {
            vazio.hidden = notificacoes.length > 0;
        }

        notificacoes.forEach(notificacao => {
            const item = document.createElement("div");

            item.className = "notificacao-item" +
                (notificacao.lida ? "" : " nao-lida");

            item.tabIndex = 0;
            item.setAttribute("role", "button");

            const titulo = document.createElement("h4");
            titulo.textContent = notificacao.titulo;

            const mensagem = document.createElement("p");
            mensagem.textContent = notificacao.mensagem;

            const data = document.createElement("small");
            data.textContent = formatarData(notificacao.criadaEm);

            item.append(titulo, mensagem, data);

            async function marcarComoLida() {
                if (notificacao.lida) return;

                const email = obterEmailCliente();

                if (!email) {
                    alert("Não foi possível identificar o cliente.");
                    return;
                }

                try {
                    const resposta = await fetch(
                        `${API_NOTIFICACOES}/${notificacao.id}/lida?email=${encodeURIComponent(email)}`,
                        {
                            method: "PATCH"
                        }
                    );

                    if (!resposta.ok) {
                        throw new Error("Não foi possível marcar como lida.");
                    }

                    notificacao.lida = true;
                    renderizarNotificacoes();

                } catch (erro) {
                    console.error("Erro ao marcar notificação:", erro);
                    alert("Não foi possível atualizar a notificação.");
                }
            }

            item.addEventListener("click", marcarComoLida);

            item.addEventListener("keydown", evento => {
                if (evento.key === "Enter" || evento.key === " ") {
                    evento.preventDefault();
                    marcarComoLida();
                }
            });

            lista.appendChild(item);
        });
    }

    async function carregarNotificacoes() {
        const email = obterEmailCliente();

        if (!email) {
            notificacoes = [];
            renderizarNotificacoes();
            return;
        }

        try {
            const resposta = await fetch(
                `${API_NOTIFICACOES}/cliente?email=${encodeURIComponent(email)}`
            );

            if (!resposta.ok) {
                throw new Error("Erro ao buscar notificações.");
            }

            const dados = await resposta.json();

            notificacoes = Array.isArray(dados) ? dados : [];

            renderizarNotificacoes();

        } catch (erro) {
            console.error("Erro ao carregar notificações:", erro);

            notificacoes = [];
            renderizarNotificacoes();
        }
    }

    botao.addEventListener("click", evento => {
        evento.preventDefault();
        evento.stopPropagation();

        const vaiAbrir = painel.hidden;

        painel.hidden = !vaiAbrir;

        botao.setAttribute("aria-expanded", String(vaiAbrir));

        if (vaiAbrir) {
            carregarNotificacoes();
        }
    });

    document.addEventListener("click", evento => {
        if (
            !painel.hidden &&
            !painel.contains(evento.target) &&
            !botao.contains(evento.target)
        ) {
            painel.hidden = true;
            botao.setAttribute("aria-expanded", "false");
        }
    });

    document.addEventListener("keydown", evento => {
        if (evento.key === "Escape") {
            painel.hidden = true;
            botao.setAttribute("aria-expanded", "false");
        }
    });

    if (marcarTodas) {
        marcarTodas.addEventListener("click", async () => {
            const email = obterEmailCliente();

            if (!email) {
                alert("Não foi possível identificar o cliente.");
                return;
            }

            try {
                const resposta = await fetch(
                    `${API_NOTIFICACOES}/lidas?email=${encodeURIComponent(email)}`,
                    {
                        method: "PATCH"
                    }
                );

                if (!resposta.ok) {
                    throw new Error("Não foi possível atualizar as notificações.");
                }

                notificacoes.forEach(notificacao => {
                    notificacao.lida = true;
                });

                renderizarNotificacoes();

            } catch (erro) {
                console.error("Erro ao marcar todas como lidas:", erro);
                alert("Não foi possível marcar todas como lidas.");
            }
        });
    }

    carregarNotificacoes();
}


/* =========================================
   INICIALIZAÇÃO
========================================= */

function inicializarGradeAulas() {
    atualizarAvatarMini();
    configurarNotificacoes();
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        inicializarGradeAulas
    );
} else {
    inicializarGradeAulas();
}

window.addEventListener("pageshow", atualizarAvatarMini);

window.addEventListener("storage", evento => {
    if (evento.key === CHAVE_PERFIL) {
        atualizarAvatarMini();
    }
});
/* =========================================
   ATUALIZAR NOME E AVATAR DO CLIENTE
========================================= */

function atualizarPerfilCabecalho() {
    try {
        const perfil = JSON.parse(
            localStorage.getItem("jadeSpaPerfil") || "null"
        );

        if (!perfil || !perfil.nome) {
            console.warn("Perfil do cliente não encontrado.");
            return;
        }

        const nome = perfil.nome.trim();

        if (!nome) return;

        const partes = nome.split(/\s+/).filter(Boolean);

        const inicial = partes[0][0];

        const avatar = document.querySelector(".avatar-mini");

        if (avatar) {
         avatar.textContent = inicial.toUpperCase();
        }

    } catch (erro) {
        console.error("Erro ao atualizar avatar:", erro);
    }
}

atualizarPerfilCabecalho();

window.addEventListener("pageshow", atualizarPerfilCabecalho);

window.addEventListener("storage", evento => {
    if (evento.key === "jadeSpaPerfil") {
        atualizarPerfilCabecalho();
    }
});