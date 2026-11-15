
/* ==========================================
   JADE SPA - HOME
   Perfil, notificações, planos e agendamentos
========================================== */

// Impede a inicialização duplicada caso o script
// seja incluído duas vezes no HTML.
if (!window.jadeSpaHomeInicializada) {
    window.jadeSpaHomeInicializada = true;

    document.addEventListener("DOMContentLoaded", () => {
        const CHAVE_PERFIL = "jadeSpaPerfil";
        const CHAVE_NOTIFICACOES = "jadeSpaNotificacoes";
        const CHAVE_AULAS = "jadeSpaInscricoesAulas";
        const API_AGENDAMENTOS =
            "http://localhost:8080/api/agendamentos/cliente";

        let notificacoes = [];
        let requisicaoAgendamentosHome = 0;

        /* ==========================================
           PERFIL
        ========================================== */

        function atualizarPerfilHome() {
            const dadosSalvos = localStorage.getItem(CHAVE_PERFIL);
            if (!dadosSalvos) return;

            try {
                const dados = JSON.parse(dadosSalvos);

                if (!dados.nome || !dados.nome.trim()) return;

                const nome = dados.nome.trim();

                const titulo = document.querySelector(
                    ".perfil-textos h1"
                );

                const avatar = document.querySelector(
                    ".perfil-destaque .avatar-grande"
                );

                const avatarMini = document.querySelector(
                    ".avatar-mini"
                );

                if (titulo) {
                    titulo.textContent = `Olá, ${nome}!`;
                }

                const partes = nome.split(/\s+/).filter(Boolean);

                const iniciais = partes.length > 1
                    ? partes[0][0] + partes[partes.length - 1][0]
                    : partes[0][0];

                if (avatar) {
                    avatar.textContent = iniciais.toUpperCase();
                }

                if (avatarMini) {
                    avatarMini.textContent =
                        iniciais[0].toUpperCase();
                }

            } catch (erro) {
                console.error("Erro ao atualizar perfil:", erro);
            }
        }

       /* ==========================================
   NOTIFICAÇÕES - BANCO DE DADOS
========================================== */

const API_NOTIFICACOES =
    "http://localhost:8080/api/notificacoes";

const botaoNotificacoes =
    document.getElementById("btnNotificacoes");

const painelNotificacoes =
    document.getElementById("painelNotificacoes");

const listaNotificacoes =
    document.getElementById("listaNotificacoes");

const contadorNotificacoes =
    document.getElementById("notificacaoContador");

const pontoNotificacao =
    document.getElementById("notificacaoPonto");

const vazioNotificacoes =
    document.getElementById("notificacoesVazio");

const marcarTodasLidas =
    document.getElementById("marcarTodasLidas");

const modalPlanos =
    document.getElementById("modalPlanos");


function obterEmailCliente() {
    try {
        const perfil = JSON.parse(
            localStorage.getItem(CHAVE_PERFIL) || "null"
        );

        return perfil && perfil.email
            ? perfil.email.trim().toLowerCase()
            : null;

    } catch (erro) {
        console.error(
            "Erro ao obter e-mail do cliente:",
            erro
        );

        return null;
    }
}


function formatarDataNotificacao(data) {
    if (!data) return "";

    const dataObj = new Date(data);

    if (Number.isNaN(dataObj.getTime())) {
        return "";
    }

    return dataObj.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


function renderizarNotificacoes() {
    if (!listaNotificacoes) return;

    listaNotificacoes.replaceChildren();

    const naoLidas = notificacoes.filter(
        n => !n.lida
    ).length;

    if (contadorNotificacoes) {
        contadorNotificacoes.textContent = naoLidas;
        contadorNotificacoes.hidden = naoLidas === 0;
    }

    if (pontoNotificacao) {
        pontoNotificacao.hidden = naoLidas === 0;
    }

    if (vazioNotificacoes) {
        vazioNotificacoes.hidden =
            notificacoes.length > 0;
    }

    notificacoes.forEach(notificacao => {

        const item = document.createElement("div");

        item.className =
            "notificacao-item" +
            (notificacao.lida ? "" : " nao-lida");

        item.tabIndex = 0;
        item.setAttribute("role", "button");

        item.setAttribute(
            "aria-label",
            `${notificacao.titulo}. ${
                notificacao.lida ? "Lida" : "Não lida"
            }`
        );

        const titulo = document.createElement("h4");
        titulo.textContent =
            notificacao.titulo || "Notificação";

        const mensagem = document.createElement("p");
        mensagem.textContent =
            notificacao.mensagem || "";

        const data = document.createElement("small");
        data.textContent =
            formatarDataNotificacao(notificacao.criadaEm);

        item.append(titulo, mensagem, data);


        async function marcarComoLida() {

            if (notificacao.lida) return;

            const email = obterEmailCliente();

            if (!email) return;

            try {
                const resposta = await fetch(
                    `${API_NOTIFICACOES}/${notificacao.id}/lida?email=${encodeURIComponent(email)}`,
                    {
                        method: "PATCH"
                    }
                );

                if (!resposta.ok) {
                    throw new Error(
                        "Não foi possível marcar a notificação como lida."
                    );
                }

                await carregarNotificacoesApi();

            } catch (erro) {
                console.error(
                    "Erro ao marcar notificação como lida:",
                    erro
                );
            }
        }


        item.addEventListener(
            "click",
            marcarComoLida
        );

        item.addEventListener("keydown", evento => {

            if (
                evento.key === "Enter" ||
                evento.key === " "
            ) {
                evento.preventDefault();
                marcarComoLida();
            }

        });

        listaNotificacoes.appendChild(item);

    });
}


async function carregarNotificacoesApi() {

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
            throw new Error(
                "Não foi possível consultar as notificações."
            );
        }

        const dados = await resposta.json();

        notificacoes = Array.isArray(dados)
            ? dados
            : [];

        renderizarNotificacoes();

    } catch (erro) {

        console.error(
            "Erro ao carregar notificações do banco:",
            erro
        );

        notificacoes = [];
        renderizarNotificacoes();
    }
}


// ABRIR E FECHAR O PAINEL
if (botaoNotificacoes && painelNotificacoes) {

    botaoNotificacoes.addEventListener("click", evento => {

        evento.stopPropagation();

        const vaiAbrir = painelNotificacoes.hidden;

        painelNotificacoes.hidden = !vaiAbrir;

        botaoNotificacoes.setAttribute(
            "aria-expanded",
            String(vaiAbrir)
        );

        if (vaiAbrir) {
            carregarNotificacoesApi();
        }

    });


    document.addEventListener("click", evento => {

        if (
            !painelNotificacoes.hidden &&
            !painelNotificacoes.contains(evento.target) &&
            !botaoNotificacoes.contains(evento.target)
        ) {

            painelNotificacoes.hidden = true;

            botaoNotificacoes.setAttribute(
                "aria-expanded",
                "false"
            );
        }

    });

}


// MARCAR TODAS COMO LIDAS
if (marcarTodasLidas) {

    marcarTodasLidas.addEventListener(
        "click",
        async () => {

            const email = obterEmailCliente();

            if (!email) return;

            try {

                const resposta = await fetch(
                    `${API_NOTIFICACOES}/lidas?email=${encodeURIComponent(email)}`,
                    {
                        method: "PATCH"
                    }
                );

                if (!resposta.ok) {
                    throw new Error(
                        "Não foi possível atualizar as notificações."
                    );
                }

                await carregarNotificacoesApi();

            } catch (erro) {

                console.error(
                    "Erro ao marcar todas como lidas:",
                    erro
                );
            }

        }
    );
}

        /* ==========================================
           MODAL DE PLANOS
        ========================================== */

        function fecharModalPlanosInterno() {
            if (modalPlanos) {
                modalPlanos.classList.remove("ativo");
            }
        }

        if (modalPlanos) {
            modalPlanos.addEventListener("click", evento => {
                if (evento.target === modalPlanos) {
                    fecharModalPlanosInterno();
                }
            });
        }

        document.addEventListener("keydown", evento => {
            if (evento.key === "Escape") {
                if (
                    painelNotificacoes &&
                    !painelNotificacoes.hidden
                ) {
                    painelNotificacoes.hidden = true;

                    if (botaoNotificacoes) {
                        botaoNotificacoes.setAttribute(
                            "aria-expanded",
                            "false"
                        );
                    }
                }

                fecharModalPlanosInterno();
            }
        });

        /* ==========================================
           PRÓXIMOS AGENDAMENTOS
        ========================================== */

        function formatarDataHome(data) {
            if (
                !data ||
                !/^\d{4}-\d{2}-\d{2}$/.test(data)
            ) {
                return null;
            }

            const [ano, mes, dia] =
                data.split("-").map(Number);

            return new Date(ano, mes - 1, dia, 12);
        }

        function normalizarTexto(valor) {
            return String(valor || "")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim()
                .toLowerCase();
        }

        function criarCartaoHome({
            nome,
            data,
            horario,
            profissional,
            descricao,
            tipo,
            status: statusAtual
        }) {
            const item = document.createElement("div");
            item.className = "agendamento-item";

            const dataObj = formatarDataHome(data);

            const dataBloco = document.createElement("div");
            dataBloco.className = "data-bloco";

            const dia = document.createElement("strong");

            dia.textContent = dataObj
                ? String(dataObj.getDate()).padStart(2, "0")
                : "--";

            const meses = [
                "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
                "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"
            ];

            const mes = document.createElement("span");

            mes.textContent = dataObj
                ? meses[dataObj.getMonth()]
                : "";

            dataBloco.append(dia, mes);

            const detalhes = document.createElement("div");
            detalhes.className = "detalhes-bloco";

            const titulo = document.createElement("h4");
            titulo.textContent = nome || "Agendamento";

            const info = document.createElement("p");

            info.textContent = tipo === "aula"
                ? `Aula • ${descricao || ""}`
                : `Profissional: ${profissional || "Não informado"}`;

            const hora = document.createElement("p");
            hora.append("Horário: ");

            const horaForte = document.createElement("strong");
            horaForte.textContent = horario || "A confirmar";

            hora.appendChild(horaForte);

            detalhes.append(titulo, info, hora);

            const statusBloco = document.createElement("div");
            statusBloco.className = "status-bloco";

            const status = document.createElement("span");
            status.className = "tag-status";
            status.textContent = statusAtual || "Pendente";

            statusBloco.appendChild(status);

            item.append(
                dataBloco,
                detalhes,
                statusBloco
            );

            return item;
        }

        async function renderizarProximosAgendamentosHome() {
            const lista = document.getElementById(
                "listaProximosAgendamentos"
            );

            if (!lista) return;

            const numeroRequisicao =
                ++requisicaoAgendamentosHome;

            try {
                const perfil = JSON.parse(
                    localStorage.getItem(CHAVE_PERFIL) || "null"
                );

                if (!perfil || !perfil.email) {
                    if (
                        numeroRequisicao !==
                        requisicaoAgendamentosHome
                    ) return;

                    lista.replaceChildren();

                    const vazio = document.createElement("p");
                    vazio.className =
                        "mensagem-sem-agendamentos";

                    vazio.textContent =
                        "Entre na sua conta para visualizar seus agendamentos.";

                    lista.appendChild(vazio);
                    return;
                }

                const resposta = await fetch(
                    API_AGENDAMENTOS +
                    "?email=" +
                    encodeURIComponent(perfil.email)
                );

                if (!resposta.ok) {
                    throw new Error(
                        "Erro ao consultar agendamentos no banco."
                    );
                }

                const dados = await resposta.json();

                // Descarta respostas antigas.
                if (
                    numeroRequisicao !==
                    requisicaoAgendamentosHome
                ) return;

                if (!Array.isArray(dados)) {
                    throw new Error(
                        "O servidor retornou dados inválidos."
                    );
                }

                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);

                const diasSemana = {
                    "domingo": 0,
                    "segunda-feira": 1,
                    "terca-feira": 2,
                    "quarta-feira": 3,
                    "quinta-feira": 4,
                    "sexta-feira": 5,
                    "sabado": 6
                };

                /*
                 * Remove duplicações por ID e também
                 * registros repetidos com os mesmos dados.
                 */
                const idsVistos = new Set();
                const chavesVistas = new Set();

                const registrosUnicos = dados.filter(item => {
                    if (item.id !== undefined && item.id !== null) {
                        const id = String(item.id);

                        if (idsVistos.has(id)) {
                            return false;
                        }

                        idsVistos.add(id);
                    }

                    const chave = [
                        normalizarTexto(item.tipo),
                        normalizarTexto(item.nomeItem),
                        normalizarTexto(item.data),
                        normalizarTexto(item.diaSemana),
                        normalizarTexto(item.horario),
                        normalizarTexto(item.profissional),
                        normalizarTexto(item.clienteEmail || perfil.email)
                    ].join("|");

                    if (chavesVistas.has(chave)) {
                        return false;
                    }

                    chavesVistas.add(chave);
                    return true;
                });

                const compromissos = registrosUnicos
                    .filter(item => {
                        const status = normalizarTexto(item.status);
                        const tipo = String(item.tipo || "")
                            .toUpperCase();

                        return (
                            (
                                tipo === "TRATAMENTO" ||
                                tipo === "AULA"
                            ) &&
                            status !== "cancelado" &&
                            status !== "concluido"
                        );
                    })
                    .map(item => {
                        const tipo = String(item.tipo || "")
                            .toUpperCase();

                        let dataCompromisso = item.data || "";
                        let descricao = "Tratamento";

                        if (tipo === "AULA") {
                            const diaNome = normalizarTexto(
                                item.diaSemana
                            );

                            const diaAlvo = diasSemana[diaNome];

                            if (diaAlvo === undefined) {
                                return null;
                            }

                            const dataAula = new Date();
                            dataAula.setHours(12, 0, 0, 0);

                            const diferenca =
                                (diaAlvo - dataAula.getDay() + 7) % 7;

                            dataAula.setDate(
                                dataAula.getDate() + diferenca
                            );

                            const ano = dataAula.getFullYear();

                            const mes = String(
                                dataAula.getMonth() + 1
                            ).padStart(2, "0");

                            const dia = String(
                                dataAula.getDate()
                            ).padStart(2, "0");

                            dataCompromisso =
                                `${ano}-${mes}-${dia}`;

                            descricao = item.diaSemana || "Aula";
                        }

                        return {
                            nome: item.nomeItem,
                            data: dataCompromisso,
                            horario: item.horario,
                            profissional: item.profissional,
                            descricao,
                            tipo: tipo === "AULA"
                                ? "aula"
                                : "servico",
                            status: item.status || "Pendente"
                        };
                    })
                    .filter(item => {
                        if (!item) return false;

                        const data = formatarDataHome(item.data);

                        return data && data >= hoje;
                    })
                    .sort((a, b) => {
                        return `${a.data} ${a.horario}`.localeCompare(
                            `${b.data} ${b.horario}`
                        );
                    })
                    .slice(0, 4);

                if (
                    numeroRequisicao !==
                    requisicaoAgendamentosHome
                ) return;

                // Limpa a lista antes de inserir os cartões.
                lista.replaceChildren();

                if (compromissos.length === 0) {
                    const vazio = document.createElement("p");

                    vazio.className =
                        "mensagem-sem-agendamentos";

                    vazio.textContent =
                        "Você não tem próximos agendamentos.";

                    lista.appendChild(vazio);
                    return;
                }

                compromissos.forEach(compromisso => {
                    lista.appendChild(
                        criarCartaoHome(compromisso)
                    );
                });

            } catch (erro) {
                if (
                    numeroRequisicao !==
                    requisicaoAgendamentosHome
                ) return;

                console.error(
                    "Erro ao carregar agendamentos:",
                    erro
                );

                lista.replaceChildren();

                const vazio = document.createElement("p");

                vazio.className =
                    "mensagem-sem-agendamentos";

                vazio.textContent =
                    "Não foi possível atualizar seus agendamentos.";

                lista.appendChild(vazio);
            }
        }

        /* ==========================================
           INICIALIZAÇÃO
        ========================================== */

        atualizarPerfilHome();

// Busca as notificações no banco assim que a página abre.
carregarNotificacoesApi();

renderizarProximosAgendamentosHome();

// Atualiza as notificações automaticamente a cada 30 segundos.
setInterval(() => {
    carregarNotificacoesApi();
}, 30000);

        // Atualiza quando a página volta a ficar visível.
        document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        carregarNotificacoesApi();
        renderizarProximosAgendamentosHome();
    }
});

        // Atualiza quando os dados mudam em outra aba.
        window.addEventListener("storage", evento => {
            if (evento.key === CHAVE_PERFIL) {
                atualizarPerfilHome();
            }

            if (evento.key === CHAVE_NOTIFICACOES) {
                notificacoes = carregarNotificacoes();
                renderizarNotificacoes();
            }

            if (
                evento.key === CHAVE_AULAS ||
                evento.key === null
            ) {
                renderizarProximosAgendamentosHome();
            }
        });

        // Atualiza quando o usuário retorna à janela.
        window.addEventListener("focus", () => {
            renderizarProximosAgendamentosHome();
        });
    });
}

/* ==========================================
   FUNÇÕES GLOBAIS DOS BOTÕES
========================================== */

// Mantida para compatibilidade com botões antigos.
function cancelarItemHome(idItem) {
    if (!confirm("Tem certeza que deseja cancelar este agendamento?")) {
        return;
    }

    const elemento = document.getElementById(idItem);

    if (elemento) {
        elemento.style.transition = "all 0.4s ease";
        elemento.style.opacity = "0";
        elemento.style.transform = "scale(0.95)";

        setTimeout(() => {
            elemento.remove();
        }, 400);
    }
}

function abrirModalPlanos() {
    const modal = document.getElementById("modalPlanos");

    if (modal) {
        modal.classList.add("ativo");
    }
}

function fecharModalPlanos() {
    const modal = document.getElementById("modalPlanos");

    if (modal) {
        modal.classList.remove("ativo");
    }
}
/* =========================================
   AVISO DE TROCA DE PLANO
========================================= */

function abrirAvisoTrocaPlano() {
    const modal = document.getElementById("modalTrocaPlano");

    if (modal) {
        modal.hidden = false;
        document.body.style.overflow = "hidden";
    }
}

function fecharAvisoTrocaPlano() {
    const modal = document.getElementById("modalTrocaPlano");

    if (modal) {
        modal.hidden = true;
        document.body.style.overflow = "";
    }
}

// Fechar ao clicar fora da mensagem
document.addEventListener("click", function(event) {
    const modal = document.getElementById("modalTrocaPlano");

    if (modal && event.target === modal) {
        fecharAvisoTrocaPlano();
    }
});

// Fechar com ESC
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        fecharAvisoTrocaPlano();
    }
});