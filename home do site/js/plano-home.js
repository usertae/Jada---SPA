
document.addEventListener("DOMContentLoaded", () => {
    const API_ASSINATURAS =
        "http://localhost:8080/api/assinaturas";

    const CHAVE_PERFIL = "jadeSpaPerfil";

    const statusPlano = document.getElementById("statusPlanoHome");
    const nomePlano = document.getElementById("nomePlanoAtual");
    const descricaoPlano = document.getElementById("descricaoPlanoHome");
    const valorPlano = document.getElementById("valorPlanoHome");
    const botaoPlano = document.getElementById("botaoPlanoHome");

    const modalPlanos = document.getElementById("modalPlanos");
    const modalTrocaPlano = document.getElementById("modalTrocaPlano");
    const botaoFecharPlanos = document.getElementById("btnFecharPlanos");

    if (!statusPlano || !nomePlano || !descricaoPlano || !botaoPlano) {
        console.error("Elementos do cartão de plano não encontrados.");
        return;
    }

    function obterPerfil() {
        try {
            return JSON.parse(
                localStorage.getItem(CHAVE_PERFIL) || "null"
            );
        } catch (erro) {
            console.error("Erro ao ler o perfil:", erro);
            return null;
        }
    }

    function formatarValor(valor) {
        const numero = Number(valor);

        if (!Number.isFinite(numero)) {
            return "";
        }

        return numero.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function mostrarCarregando() {
        statusPlano.textContent = "CARREGANDO PLANO...";
        nomePlano.textContent = "Carregando...";
        descricaoPlano.textContent = "Consultando seu plano no Jade Spa.";

        valorPlano.hidden = true;
        botaoPlano.style.display = "none";
    }

    function mostrarSemPlano() {
        statusPlano.textContent = "SEM PLANO ATIVO";
        nomePlano.textContent = "Nenhum plano ativo";
        descricaoPlano.textContent =
            "Escolha seu plano agora e aproveite os benefícios do Jade Spa.";

        valorPlano.textContent = "";
        valorPlano.hidden = true;

        botaoPlano.textContent = "Escolher meu plano";
        botaoPlano.style.display = "block";

        botaoPlano.onclick = () => {
    const aviso = document.getElementById("modalTrocaPlano");

    if (aviso) {
        aviso.hidden = false;
        document.body.style.overflow = "hidden";
    }
};
    }

    function mostrarPlanoAtivo(dados) {
        const plano = dados.plano;

        if (!plano) {
            mostrarSemPlano();
            return;
        }

        statusPlano.textContent = "PLANO ATIVO";
        nomePlano.textContent = plano.nome || "Plano contratado";

        descricaoPlano.textContent =
            plano.descricao || "Seu plano está ativo no Jade Spa.";

        const valorFormatado = formatarValor(plano.valor);

        if (valorFormatado) {
            valorPlano.textContent = `${valorFormatado} / mês`;
            valorPlano.hidden = false;
        } else {
            valorPlano.hidden = true;
        }

        botaoPlano.textContent = "Trocar de Plano";
        botaoPlano.style.display = "block";

        botaoPlano.onclick = () => {
            if (modalTrocaPlano) {
                modalTrocaPlano.hidden = false;
                document.body.style.overflow = "hidden";
            }
        };
    }

    async function carregarPlanoHome() {
        mostrarCarregando();

        const perfil = obterPerfil();

        if (!perfil || !perfil.id) {
            statusPlano.textContent = "ACESSO NECESSÁRIO";
            nomePlano.textContent = "Faça login";
            descricaoPlano.textContent =
                "Entre na sua conta para consultar seu plano.";

            botaoPlano.style.display = "none";
            return;
        }

        try {
            const resposta = await fetch(
                `${API_ASSINATURAS}/cliente/${perfil.id}/ativa`
            );

            if (!resposta.ok) {
                throw new Error(
                    `Erro ao consultar assinatura: ${resposta.status}`
                );
            }

            const dados = await resposta.json();

            if (dados.temPlano === true) {
                mostrarPlanoAtivo(dados);
            } else {
                mostrarSemPlano();
            }

        } catch (erro) {
            console.error("Erro ao carregar plano:", erro);

            statusPlano.textContent = "ERRO AO CARREGAR";
            nomePlano.textContent = "Não foi possível consultar";
            descricaoPlano.textContent =
                "Verifique se o servidor do Jade Spa está funcionando.";

            botaoPlano.style.display = "none";
        }
    }

    // Fechar o modal de escolha de planos
    if (botaoFecharPlanos && modalPlanos) {
        botaoFecharPlanos.addEventListener("click", () => {
            modalPlanos.classList.remove("ativo");
        });
    }

    if (modalPlanos) {
        modalPlanos.addEventListener("click", evento => {
            if (evento.target === modalPlanos) {
                modalPlanos.classList.remove("ativo");
            }
        });
    }

    // Fechar o aviso de troca de plano
    if (modalTrocaPlano) {
        modalTrocaPlano.addEventListener("click", evento => {
            if (evento.target === modalTrocaPlano) {
                modalTrocaPlano.hidden = true;
                document.body.style.overflow = "";
            }
        });
    }

    document.addEventListener("keydown", evento => {
        if (evento.key === "Escape") {
            if (modalPlanos) {
                modalPlanos.classList.remove("ativo");
            }

            if (modalTrocaPlano) {
                modalTrocaPlano.hidden = true;
                document.body.style.overflow = "";
            }
        }
    });

    // Atualizar o cartão quando a página for aberta novamente
    carregarPlanoHome();

    window.addEventListener("pageshow", carregarPlanoHome);
});
