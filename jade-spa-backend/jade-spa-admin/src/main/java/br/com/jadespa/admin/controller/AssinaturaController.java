
package br.com.jadespa.admin.controller;

import br.com.jadespa.admin.model.Assinatura;
import br.com.jadespa.admin.repository.AssinaturaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/assinaturas")
@CrossOrigin(origins = {
    "http://127.0.0.1:5500",
    "http://localhost:5500"
})
public class AssinaturaController {

    private final AssinaturaRepository repository;

    public AssinaturaController(AssinaturaRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/cliente/{clienteId}/ativa")
    public ResponseEntity<?> buscarAssinaturaAtiva(
            @PathVariable Long clienteId) {

        Optional<Assinatura> resultado =
                repository.findFirstByClienteIdAndStatusOrderByDataInicioDesc(
                        clienteId, "ATIVA");

        if (resultado.isEmpty()) {
            Map<String, Object> resposta = new LinkedHashMap<>();
            resposta.put("temPlano", false);
            resposta.put("mensagem", "Você ainda não possui um plano ativo.");

            return ResponseEntity.ok(resposta);
        }

        Assinatura assinatura = resultado.get();

        Map<String, Object> resposta = new LinkedHashMap<>();

        resposta.put("temPlano", true);
        resposta.put("idAssinatura", assinatura.getId());
        resposta.put("status", assinatura.getStatus());
        resposta.put("dataInicio", assinatura.getDataInicio());
        resposta.put("dataFim", assinatura.getDataFim());

        resposta.put("plano", Map.of(
                "id", assinatura.getPlano().getId(),
                "nome", assinatura.getPlano().getNome(),
                "descricao", assinatura.getPlano().getDescricao(),
                "valor", assinatura.getPlano().getValor()
        ));

        return ResponseEntity.ok(resposta);
    }
}
