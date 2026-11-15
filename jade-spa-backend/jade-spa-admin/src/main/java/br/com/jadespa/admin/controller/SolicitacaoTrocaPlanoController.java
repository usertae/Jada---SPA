
package br.com.jadespa.admin.controller;

import br.com.jadespa.admin.model.SolicitacaoTrocaPlano;
import br.com.jadespa.admin.service.SolicitacaoTrocaPlanoService;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

@RestController
@RequestMapping("/api/solicitacoes-planos")
@CrossOrigin(origins = {
    "http://127.0.0.1:5500",
    "http://localhost:5500"
})
public class SolicitacaoTrocaPlanoController {

    private final SolicitacaoTrocaPlanoService service;

    public SolicitacaoTrocaPlanoController(
            SolicitacaoTrocaPlanoService service) {

        this.service = service;
    }

    // ===== CONVERTER SOLICITAÇÃO EM RESPOSTA SEGURA =====

    private Map<String, Object> converterSolicitacao(
            SolicitacaoTrocaPlano solicitacao) {

        Map<String, Object> dados = new LinkedHashMap<>();

        dados.put("id", solicitacao.getId());
        dados.put("valor", solicitacao.getValor());
        dados.put("status", solicitacao.getStatus());
        dados.put("comprovante", solicitacao.getComprovante());
        dados.put("observacaoAdmin", solicitacao.getObservacaoAdmin());
        dados.put("dataSolicitacao", solicitacao.getDataSolicitacao());
        dados.put("dataAnalise", solicitacao.getDataAnalise());

        // Dados do cliente, sem informações de senha
        Map<String, Object> cliente = new LinkedHashMap<>();

        cliente.put("id", solicitacao.getCliente().getId());
        cliente.put("nome", solicitacao.getCliente().getNome());
        cliente.put("email", solicitacao.getCliente().getEmail());
        cliente.put("telefone", solicitacao.getCliente().getTelefone());

        dados.put("cliente", cliente);

        // Dados do plano
        Map<String, Object> plano = new LinkedHashMap<>();

        plano.put("id", solicitacao.getPlano().getId());
        plano.put("nome", solicitacao.getPlano().getNome());
        plano.put("descricao", solicitacao.getPlano().getDescricao());
        plano.put("valor", solicitacao.getPlano().getValor());

        dados.put("plano", plano);

        return dados;
    }

    // 1. CLIENTE SOLICITA UM PLANO

    @PostMapping("/cliente/{clienteId}/plano/{planoId}")
    public ResponseEntity<Map<String, Object>> solicitar(
            @PathVariable Long clienteId,
            @PathVariable Long planoId) {

        SolicitacaoTrocaPlano solicitacao =
                service.criarSolicitacao(clienteId, planoId);

        return ResponseEntity.ok(
                converterSolicitacao(solicitacao)
        );
    }

    // 2. CLIENTE ENVIA O COMPROVANTE PIX

    @PostMapping(
        value = "/{id}/comprovante",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Map<String, Object>> enviarComprovante(
            @PathVariable Long id,
            @RequestParam("arquivo") MultipartFile arquivo) {

        SolicitacaoTrocaPlano solicitacao =
                service.enviarComprovante(id, arquivo);

        return ResponseEntity.ok(
                converterSolicitacao(solicitacao)
        );
    }

    // 3. CLIENTE SIMULA O PAGAMENTO PIX

    @PostMapping("/{id}/pix-simulado")
    public ResponseEntity<Map<String, Object>> confirmarPixSimulado(
            @PathVariable Long id) {

        SolicitacaoTrocaPlano solicitacao =
                service.confirmarPagamentoSimulado(id);

        return ResponseEntity.ok(
                converterSolicitacao(solicitacao)
        );
    }

    // 4. CLIENTE CONSULTA SUAS SOLICITAÇÕES

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<Map<String, Object>>> listarCliente(
            @PathVariable Long clienteId) {

        List<Map<String, Object>> solicitacoes =
                service.listarSolicitacoesCliente(clienteId)
                        .stream()
                        .map(this::converterSolicitacao)
                        .toList();

        return ResponseEntity.ok(solicitacoes);
    }

    // 5. ADMINISTRADOR CONSULTA SOLICITAÇÕES PENDENTES

    @GetMapping("/admin/pendentes")
    public ResponseEntity<List<Map<String, Object>>> listarPendentes() {

        List<Map<String, Object>> solicitacoes =
                service.listarSolicitacoesPendentes()
                        .stream()
                        .map(this::converterSolicitacao)
                        .toList();

        return ResponseEntity.ok(solicitacoes);
    }

    // 6. ADMINISTRADOR APROVA UMA SOLICITAÇÃO

    @PutMapping("/admin/{id}/aprovar")
    public ResponseEntity<Map<String, Object>> aprovar(
            @PathVariable Long id) {

        SolicitacaoTrocaPlano solicitacao =
                service.aprovar(id);

        return ResponseEntity.ok(
                converterSolicitacao(solicitacao)
        );
    }

    // 7. ADMINISTRADOR REJEITA UMA SOLICITAÇÃO

    @PutMapping("/admin/{id}/rejeitar")
    public ResponseEntity<Map<String, Object>> rejeitar(
            @PathVariable Long id,
            @RequestBody Map<String, String> dados) {

        String motivo = dados.get("motivo");

        SolicitacaoTrocaPlano solicitacao =
                service.rejeitar(id, motivo);

        return ResponseEntity.ok(
                converterSolicitacao(solicitacao)
        );
    }
}
