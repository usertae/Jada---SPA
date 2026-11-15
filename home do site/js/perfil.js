
document.addEventListener("DOMContentLoaded", async () => {

    const API_CLIENTES = "http://localhost:8080/api/clientes";
    const API_PLANOS = "http://localhost:8080/api/planos";
    const API_ASSINATURAS = "http://localhost:8080/api/assinaturas";
    const API_SOLICITACOES = "http://localhost:8080/api/solicitacoes-planos";

    const CHAVE_PERFIL = "jadeSpaPerfil";

    // ===== ELEMENTOS DO PERFIL =====

    const form = document.getElementById("formPerfil");
    const btnEditar = document.getElementById("btnEditar");
    const btnCancelar = document.getElementById("btnCancelar");
    const acoes = document.getElementById("acoes");
    const mensagem = document.getElementById("mensagem");

    const campos = {
        nome: document.getElementById("nome"),
        email: document.getElementById("email"),
        telefone: document.getElementById("telefone"),
        nascimento: document.getElementById("nascimento")
    };

    const avatarGrande = document.querySelector(".avatar-grande");
    const avatarMini = document.querySelector(".avatar-mini");

    let dadosOriginais = {};
    let idCliente = null;

    // ===== SESSÃO =====

    function obterSessao() {
        try {
            return JSON.parse(localStorage.getItem(CHAVE_PERFIL));
        } catch (erro) {
            console.error("Erro ao recuperar sessão:", erro);
            return null;
        }
    }

    // ===== AVATARES =====

    function obterIniciais(nome) {
        const partes = (nome || "").trim().split(/\s+/).filter(Boolean);

        if (partes.length === 0) return "?";

        if (partes.length === 1) {
            return partes[0].charAt(0).toUpperCase();
        }

        return (
            partes[0].charAt(0) +
            partes[partes.length - 1].charAt(0)
        ).toUpperCase();
    }

    function atualizarAvatares(nome) {
        const iniciais = obterIniciais(nome);

        if (avatarGrande) avatarGrande.textContent = iniciais;
        if (avatarMini) avatarMini.textContent = iniciais;
    }

    // ===== DADOS PESSOAIS =====

    function preencherFormulario(dados) {
        campos.nome.value = dados.nome || "";
        campos.email.value = dados.email || "";
        campos.telefone.value = dados.telefone || "";
        campos.nascimento.value = dados.dataNascimento || "";

        atualizarAvatares(dados.nome || "");
    }

    function definirEdicao(permitirEditar) {
        Object.values(campos).forEach(campo => {
            campo.disabled = !permitirEditar;
        });

        btnEditar.hidden = permitirEditar;
        acoes.hidden = !permitirEditar;

        mensagem.textContent = "";
    }

    function capturarDados() {
        return {
            nome: campos.nome.value.trim(),
            email: campos.email.value.trim(),
            telefone: campos.telefone.value.trim(),
            dataNascimento: campos.nascimento.value || null
        };
    }

    async function carregarPerfil() {
        const sessao = obterSessao();

        if (!sessao || !sessao.id) {
            mensagem.textContent =
                "Não foi possível identificar sua conta. Faça login novamente.";

            form.hidden = true;
            return false;
        }

        idCliente = sessao.id;

        try {
            const resposta = await fetch(`${API_CLIENTES}/${idCliente}`);

            if (!resposta.ok) {
                throw new Error("Não foi possível carregar o perfil.");
            }

            const dados = await resposta.json();

            preencherFormulario(dados);

            dadosOriginais = {
                nome: dados.nome || "",
                email: dados.email || "",
                telefone: dados.telefone || "",
                dataNascimento: dados.dataNascimento || null
            };

            localStorage.setItem(CHAVE_PERFIL, JSON.stringify({
                ...sessao,
                ...dados
            }));

            return true;

        } catch (erro) {
            console.error("Erro ao carregar perfil:", erro);

            mensagem.textContent =
                "Não foi possível carregar seus dados. Verifique o servidor.";

            return false;
        }
    }

    btnEditar.addEventListener("click", () => {
        dadosOriginais = capturarDados();
        definirEdicao(true);
        campos.nome.focus();
    });

    btnCancelar.addEventListener("click", () => {
        preencherFormulario(dadosOriginais);
        definirEdicao(false);
        mensagem.textContent = "Alterações canceladas.";
    });

    form.addEventListener("submit", async evento => {
        evento.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const novosDados = capturarDados();

        if (!novosDados.nome || !novosDados.email) {
            mensagem.textContent = "Preencha seu nome e e-mail.";
            return;
        }

        try {
            const resposta = await fetch(`${API_CLIENTES}/${idCliente}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(novosDados)
            });

            const resultado = await resposta.json();

            if (!resposta.ok) {
                mensagem.textContent =
                    resultado.mensagem ||
                    "Não foi possível atualizar seus dados.";

                return;
            }

            const sessao = obterSessao();

            localStorage.setItem(CHAVE_PERFIL, JSON.stringify({
                ...sessao,
                ...novosDados
            }));

            preencherFormulario(novosDados);
            dadosOriginais = { ...novosDados };

            definirEdicao(false);
            mensagem.textContent = "Perfil atualizado com sucesso!";

        } catch (erro) {
            console.error("Erro ao atualizar perfil:", erro);
            mensagem.textContent = "Erro ao conectar com o servidor.";
        }
    });

    // ===== MEU PLANO =====

    const nomePlanoAtual = document.getElementById("nomePlanoAtual");
    const descricaoPlanoAtual = document.getElementById("descricaoPlanoAtual");
    const valorPlanoAtual = document.getElementById("valorPlanoAtual");
    const statusPlanoAtual = document.getElementById("statusPlanoAtual");
    const mensagemPlano = document.getElementById("mensagemPlano");
    const listaPlanos = document.getElementById("listaPlanos");

    function formatarMoeda(valor) {
        return Number(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    // ===== PLANO ATUAL =====

    async function carregarPlanoAtual() {
        try {
            const resposta = await fetch(
                `${API_ASSINATURAS}/cliente/${idCliente}/ativa`
            );

            if (!resposta.ok) {
                throw new Error("Erro ao consultar assinatura.");
            }

            const dados = await resposta.json();

            if (!dados.temPlano) {
                nomePlanoAtual.textContent = "Nenhum plano ativo";

                descricaoPlanoAtual.textContent =
                    "Você ainda não possui uma assinatura.";

                valorPlanoAtual.textContent = "--";
                statusPlanoAtual.textContent = "Sem plano";

                return;
            }

            nomePlanoAtual.textContent = dados.plano.nome;
            descricaoPlanoAtual.textContent = dados.plano.descricao || "";

            valorPlanoAtual.textContent =
                formatarMoeda(dados.plano.valor);

            statusPlanoAtual.textContent = dados.status;

        } catch (erro) {
            console.error("Erro ao carregar plano atual:", erro);

            nomePlanoAtual.textContent = "Não foi possível carregar";
            descricaoPlanoAtual.textContent = "Tente atualizar a página.";
            valorPlanoAtual.textContent = "--";
            statusPlanoAtual.textContent = "Indisponível";
        }
    }

    // ===== JANELA DE PAGAMENTO DEMONSTRATIVO =====

    function criarJanelaPix(plano, solicitacaoId) {

        const overlay = document.createElement("div");

        overlay.id = "modalPixJade";

        Object.assign(overlay.style, {
            position: "fixed",
            inset: "0",
            background: "rgba(0,0,0,0.55)",
            zIndex: "9999",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            overflowY: "auto"
        });

        const modal = document.createElement("div");

        Object.assign(modal.style, {
            background: "#ffffff",
            width: "100%",
            maxWidth: "430px",
            padding: "28px",
            borderRadius: "16px",
            textAlign: "center",
            color: "#294936",
            fontFamily: "Inter, Arial, sans-serif",
            boxShadow: "0 10px 35px rgba(0,0,0,0.2)"
        });

        const titulo = document.createElement("h2");
        titulo.textContent = "Pagamento Pix";

        const aviso = document.createElement("p");
        aviso.textContent =
            "AMBIENTE DE DEMONSTRAÇÃO — PAGAMENTO NÃO REAL";

        Object.assign(aviso.style, {
            background: "#fff3cd",
            color: "#856404",
            padding: "10px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "bold"
        });

        const nome = document.createElement("h3");
        nome.textContent = plano.nome;

        const valor = document.createElement("h2");
        valor.textContent = formatarMoeda(plano.valor) + " / mês";

        const qr = document.createElement("div");

        Object.assign(qr.style, {
            width: "160px",
            height: "160px",
            margin: "20px auto",
            border: "2px dashed #294936",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "15px",
            boxSizing: "border-box",
            fontWeight: "bold",
            fontSize: "14px"
        });

        qr.textContent = "PIX DE TESTE";

        const explicacao = document.createElement("p");
        explicacao.textContent =
            "Este código é apenas ilustrativo e não pode ser escaneado para realizar uma transferência.";

        explicacao.style.fontSize = "13px";
        explicacao.style.color = "#666";

        const identificacao = document.createElement("p");
        identificacao.textContent =
            "Solicitação nº " + solicitacaoId;

        const botaoPagar = document.createElement("button");
        botaoPagar.type = "button";
        botaoPagar.textContent = "Simular pagamento";

        Object.assign(botaoPagar.style, {
            width: "100%",
            padding: "13px",
            background: "#294936",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "15px",
            marginTop: "15px"
        });

        const botaoFechar = document.createElement("button");
        botaoFechar.type = "button";
        botaoFechar.textContent = "Fechar";

        Object.assign(botaoFechar.style, {
            width: "100%",
            padding: "12px",
            background: "#eeeeee",
            color: "#333333",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginTop: "10px"
        });

        const resultado = document.createElement("p");
        resultado.setAttribute("role", "status");

        botaoFechar.addEventListener("click", () => {
            overlay.remove();
        });

        botaoPagar.addEventListener("click", async () => {

            botaoPagar.disabled = true;
            botaoPagar.textContent = "Processando simulação...";

            try {
                const resposta = await fetch(
                    `${API_SOLICITACOES}/${solicitacaoId}/pix-simulado`,
                    {
                        method: "POST"
                    }
                );

                const dados = await resposta.json();

                if (!resposta.ok) {
                    throw new Error(
                        dados.message ||
                        dados.mensagem ||
                        "Não foi possível simular o pagamento."
                    );
                }

                resultado.textContent =
                    "Pagamento demonstrativo registrado! Sua solicitação está aguardando aprovação do administrador.";

                resultado.style.color = "#294936";
                resultado.style.fontWeight = "bold";

                botaoPagar.textContent = "Pagamento simulado";
                botaoPagar.disabled = true;

                mensagemPlano.textContent =
                    "Sua solicitação foi enviada para análise administrativa.";

                statusPlanoAtual.textContent = "Aguardando aprovação";

            } catch (erro) {
                console.error(erro);

                resultado.textContent = erro.message;
                resultado.style.color = "#b42318";

                botaoPagar.disabled = false;
                botaoPagar.textContent = "Tentar novamente";
            }
        });

        modal.append(
            titulo,
            aviso,
            nome,
            valor,
            qr,
            explicacao,
            identificacao,
            botaoPagar,
            resultado,
            botaoFechar
        );

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }

    // ===== ESCOLHER PLANO =====

   
async function escolherPlano(plano) {

    const confirmar = window.confirm(
        `Deseja solicitar o plano ${plano.nome} por ${formatarMoeda(plano.valor)} por mês?`
    );

    if (!confirmar) return;

    try {
        mensagemPlano.textContent = "Criando sua solicitação...";

        const resposta = await fetch(
            `${API_SOLICITACOES}/cliente/${idCliente}/plano/${plano.id}`,
            {
                method: "POST",
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        let dados = {};

        try {
            dados = await resposta.json();
        } catch (erro) {
            dados = {};
        }

        if (!resposta.ok) {
            throw new Error(
                dados.detail ||
                dados.message ||
                dados.mensagem ||
                dados.title ||
                `Erro ao criar solicitação. Código: ${resposta.status}`
            );
        }

        if (!dados.id) {
            throw new Error(
                "A solicitação foi recebida, mas o servidor não retornou o identificador."
            );
        }

        mensagemPlano.textContent =
            "Solicitação criada. Prossiga para o pagamento demonstrativo.";

        criarJanelaPix(plano, dados.id);

    } catch (erro) {
        console.error("Erro ao solicitar plano:", erro);

        mensagemPlano.textContent = erro.message;
    }
}


    // ===== LISTAR PLANOS DO MYSQL =====

    async function carregarPlanos() {

        listaPlanos.textContent = "Carregando planos...";

        try {
            const resposta = await fetch(API_PLANOS);

            if (!resposta.ok) {
                throw new Error("Erro ao buscar planos.");
            }

            const planos = await resposta.json();

            listaPlanos.replaceChildren();

            if (!planos.length) {
                listaPlanos.textContent =
                    "Não existem planos disponíveis no momento.";

                return;
            }

            planos.forEach(plano => {

                const card = document.createElement("div");
                card.className = "item-conta plano-card";

                const informacoes = document.createElement("div");

                const titulo = document.createElement("h3");
                titulo.textContent = plano.nome;

                const descricao = document.createElement("p");
                descricao.textContent = plano.descricao || "";

                const valor = document.createElement("p");
                valor.textContent =
                    `${formatarMoeda(plano.valor)} / mês`;

                const botao = document.createElement("button");
                botao.type = "button";
                botao.textContent = "Escolher plano";
                botao.className = "btn-principal";

                botao.addEventListener("click", () => {
                    escolherPlano(plano);
                });

                informacoes.append(titulo, descricao, valor);
                card.append(informacoes, botao);

                listaPlanos.appendChild(card);
            });

        } catch (erro) {
            console.error("Erro ao carregar planos:", erro);

            listaPlanos.textContent =
                "Não foi possível carregar os planos. Verifique se o servidor está iniciado.";
        }
    }

    // ===== INICIALIZAÇÃO =====

    const perfilCarregado = await carregarPerfil();

    if (perfilCarregado) {
        await Promise.all([
            carregarPlanoAtual(),
            carregarPlanos()
        ]);
    }

    // ===== CONTRATO (MANTIDO PARA COMPATIBILIDADE) =====

    const btnContrato = document.getElementById("btnContrato");
    const detalhesContrato = document.getElementById("detalhesContrato");

    if (btnContrato && detalhesContrato) {
        btnContrato.addEventListener("click", () => {
            const estaAberto = !detalhesContrato.hidden;

            detalhesContrato.hidden = estaAberto;

            btnContrato.textContent = estaAberto
                ? "Ver contrato"
                : "Ocultar contrato";
        });
    }

    // ===== ENCERRAR SESSÃO =====

    const btnSair = document.getElementById("btnSair");

    if (btnSair) {
        btnSair.addEventListener("click", () => {

            const confirmou = confirm(
                "Deseja realmente encerrar sua sessão?"
            );

            if (!confirmou) return;

            sessionStorage.clear();
            localStorage.removeItem(CHAVE_PERFIL);

            window.location.href =
                "../visual do site/login.cadastro.html";
        });
    }

});
