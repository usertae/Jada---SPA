
package br.com.jadespa.admin.service;

import br.com.jadespa.admin.model.Assinatura;
import br.com.jadespa.admin.model.Cliente;
import br.com.jadespa.admin.model.Plano;
import br.com.jadespa.admin.model.SolicitacaoTrocaPlano;

import br.com.jadespa.admin.repository.AssinaturaRepository;
import br.com.jadespa.admin.repository.ClienteRepository;
import br.com.jadespa.admin.repository.PlanoRepository;
import br.com.jadespa.admin.repository.SolicitacaoTrocaPlanoRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class SolicitacaoTrocaPlanoService {

    private final ClienteRepository clienteRepository;
    private final PlanoRepository planoRepository;
    private final AssinaturaRepository assinaturaRepository;
    private final SolicitacaoTrocaPlanoRepository solicitacaoRepository;
    private final NotificacaoService notificacaoService;

    public SolicitacaoTrocaPlanoService(
            ClienteRepository clienteRepository,
            PlanoRepository planoRepository,
            AssinaturaRepository assinaturaRepository,
            SolicitacaoTrocaPlanoRepository solicitacaoRepository,
            NotificacaoService notificacaoService) {

        this.clienteRepository = clienteRepository;
        this.planoRepository = planoRepository;
        this.assinaturaRepository = assinaturaRepository;
        this.solicitacaoRepository = solicitacaoRepository;
        this.notificacaoService = notificacaoService;
    }

    // CRIAR OU RECUPERAR SOLICITAÇÃO DE PLANO
    @Transactional
    public SolicitacaoTrocaPlano criarSolicitacao(
            Long clienteId,
            Long planoId) {

        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Cliente não encontrado."
                ));

        Plano plano = planoRepository.findById(planoId)
                .filter(p -> Boolean.TRUE.equals(p.getAtivo()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Plano não encontrado."
                ));

        // Busca as solicitações anteriores do cliente.
        List<SolicitacaoTrocaPlano> solicitacoes =
                solicitacaoRepository
                        .findByClienteIdOrderByDataSolicitacaoDesc(clienteId);

        // Verifica se existe uma solicitação aguardando comprovante.
        for (SolicitacaoTrocaPlano existente : solicitacoes) {

            if ("AGUARDANDO_COMPROVANTE".equals(
                    existente.getStatus())) {

                // Reutiliza a solicitação existente.
                // Se o cliente escolheu outro plano, atualiza os dados.
                existente.setPlano(plano);
                existente.setValor(plano.getValor());

                return solicitacaoRepository.save(existente);
            }
        }

        // Verifica se já existe uma solicitação aguardando análise.
        for (SolicitacaoTrocaPlano existente : solicitacoes) {

            if ("AGUARDANDO_ANALISE".equals(
                    existente.getStatus())) {

                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Você já enviou o comprovante de uma solicitação. "
                                + "Aguarde a análise do administrador."
                );
            }
        }

        // Não existe solicitação pendente: cria uma nova.
        SolicitacaoTrocaPlano solicitacao =
                new SolicitacaoTrocaPlano();

        solicitacao.setCliente(cliente);
        solicitacao.setPlano(plano);
        solicitacao.setValor(plano.getValor());
        solicitacao.setStatus("AGUARDANDO_COMPROVANTE");

        return solicitacaoRepository.save(solicitacao);
    }

    // ENVIAR COMPROVANTE PIX
    @Transactional
    public SolicitacaoTrocaPlano enviarComprovante(
            Long solicitacaoId,
            MultipartFile arquivo) {

        SolicitacaoTrocaPlano solicitacao =
                buscarSolicitacao(solicitacaoId);

        if (!"AGUARDANDO_COMPROVANTE".equals(
                solicitacao.getStatus())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Essa solicitação não está aguardando comprovante."
            );
        }

        if (arquivo == null || arquivo.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Selecione um comprovante."
            );
        }

        if (arquivo.getSize() > 5 * 1024 * 1024) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "O arquivo deve ter no máximo 5 MB."
            );
        }

        String tipo = arquivo.getContentType();

        if (tipo == null || !(
                tipo.equals("image/jpeg")
                || tipo.equals("image/png")
                || tipo.equals("application/pdf"))) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Envie um comprovante em JPG, PNG ou PDF."
            );
        }

        try {
            Path pasta = Paths.get("uploads", "comprovantes")
                    .toAbsolutePath()
                    .normalize();

            Files.createDirectories(pasta);

            String extensao = switch (tipo) {
                case "image/jpeg" -> ".jpg";
                case "image/png" -> ".png";
                case "application/pdf" -> ".pdf";
                default -> throw new IllegalArgumentException(
                        "Formato inválido."
                );
            };

            String nomeArquivo = UUID.randomUUID() + extensao;

            Path destino = pasta.resolve(nomeArquivo).normalize();

            if (!destino.startsWith(pasta)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Nome de arquivo inválido."
                );
            }

            arquivo.transferTo(destino);

            solicitacao.setComprovante(destino.toString());
            solicitacao.setStatus("AGUARDANDO_ANALISE");

            return solicitacaoRepository.save(solicitacao);

        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Não foi possível salvar o comprovante."
            );
        }
    }

    // CONFIRMAR PAGAMENTO PIX SIMULADO
    @Transactional
    public SolicitacaoTrocaPlano confirmarPagamentoSimulado(
            Long solicitacaoId) {

        SolicitacaoTrocaPlano solicitacao =
                buscarSolicitacao(solicitacaoId);

        if (!"AGUARDANDO_COMPROVANTE".equals(
                solicitacao.getStatus())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Essa solicitação não está aguardando pagamento."
            );
        }

        // Identifica o pagamento como uma simulação acadêmica.
        solicitacao.setComprovante("PIX_SIMULADO");

        // Encaminha para aprovação do administrador.
        solicitacao.setStatus("AGUARDANDO_ANALISE");

        return solicitacaoRepository.save(solicitacao);
    }

    // LISTAR SOLICITAÇÕES PENDENTES PARA O ADMINISTRADOR
    public List<SolicitacaoTrocaPlano> listarSolicitacoesPendentes() {

        return solicitacaoRepository
                .findByStatusOrderByDataSolicitacaoDesc(
                        "AGUARDANDO_ANALISE"
                );
    }

    // LISTAR SOLICITAÇÕES DE UM CLIENTE
    public List<SolicitacaoTrocaPlano> listarSolicitacoesCliente(
            Long clienteId) {

        return solicitacaoRepository
                .findByClienteIdOrderByDataSolicitacaoDesc(clienteId);
    }

    // APROVAR SOLICITAÇÃO
    @Transactional
    public SolicitacaoTrocaPlano aprovar(Long solicitacaoId) {

        SolicitacaoTrocaPlano solicitacao =
                buscarSolicitacao(solicitacaoId);

        if (!"AGUARDANDO_ANALISE".equals(solicitacao.getStatus())
                || solicitacao.getComprovante() == null
                || solicitacao.getComprovante().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A solicitação ainda não está pronta para aprovação."
            );
        }

        Cliente cliente = solicitacao.getCliente();

        assinaturaRepository
                .findFirstByClienteIdAndStatusOrderByDataInicioDesc(
                        cliente.getId(), "ATIVA"
                )
                .ifPresent(assinaturaAtual -> {
                    assinaturaAtual.setStatus("ENCERRADA");
                    assinaturaAtual.setDataFim(LocalDateTime.now());

                    assinaturaRepository.save(assinaturaAtual);
                });

        Assinatura novaAssinatura = new Assinatura();

        novaAssinatura.setCliente(cliente);
        novaAssinatura.setPlano(solicitacao.getPlano());
        novaAssinatura.setDataInicio(LocalDateTime.now());
        novaAssinatura.setStatus("ATIVA");

        assinaturaRepository.save(novaAssinatura);

        solicitacao.setStatus("APROVADA");
        solicitacao.setDataAnalise(LocalDateTime.now());

        SolicitacaoTrocaPlano salva =
                solicitacaoRepository.save(solicitacao);

        notificacaoService.criar(
                cliente.getEmail(),
                "Plano aprovado!",
                "Seu pagamento de demonstração foi aprovado e seu plano "
                        + solicitacao.getPlano().getNome()
                        + " está ativo.",
                "PLANO"
        );

        return salva;
    }

    // REJEITAR SOLICITAÇÃO
    @Transactional
    public SolicitacaoTrocaPlano rejeitar(
            Long solicitacaoId,
            String motivo) {

        SolicitacaoTrocaPlano solicitacao =
                buscarSolicitacao(solicitacaoId);

        if (!"AGUARDANDO_ANALISE".equals(solicitacao.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Essa solicitação não está aguardando análise."
            );
        }

        if (motivo == null || motivo.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe o motivo da rejeição."
            );
        }

        solicitacao.setStatus("REJEITADA");
        solicitacao.setObservacaoAdmin(motivo.trim());
        solicitacao.setDataAnalise(LocalDateTime.now());

        SolicitacaoTrocaPlano salva =
                solicitacaoRepository.save(solicitacao);

        notificacaoService.criar(
                solicitacao.getCliente().getEmail(),
                "Solicitação de plano recusada",
                "Sua solicitação foi recusada. Motivo: "
                        + motivo.trim(),
                "PLANO"
        );

        return salva;
    }

    // BUSCAR SOLICITAÇÃO PELO ID
    private SolicitacaoTrocaPlano buscarSolicitacao(Long id) {

        return solicitacaoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Solicitação não encontrada."
                ));
    }
}
