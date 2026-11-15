
package br.com.jadespa.admin.controller;

import br.com.jadespa.admin.dto.CadastroRequest;
import br.com.jadespa.admin.dto.LoginRequest;
import br.com.jadespa.admin.model.Cliente;
import br.com.jadespa.admin.repository.ClienteRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = {
    "http://127.0.0.1:5500",
    "http://localhost:5500"
})
public class ClienteController {

    private final ClienteRepository repository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public ClienteController(ClienteRepository repository) {
        this.repository = repository;
    }

    // =========================
    // CADASTRAR CLIENTE
    // =========================

    @PostMapping
    public ResponseEntity<?> cadastrar(@RequestBody CadastroRequest request) {

        if (request.getNome() == null || request.getNome().isBlank()
                || request.getEmail() == null || request.getEmail().isBlank()
                || request.getSenha() == null || request.getSenha().isBlank()) {

            return ResponseEntity.badRequest()
                    .body(Map.of("mensagem", "Preencha nome, e-mail e senha."));
        }

        String email = request.getEmail().trim().toLowerCase();

        if (repository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("mensagem", "Este e-mail já está cadastrado."));
        }

        Cliente cliente = new Cliente();

        cliente.setNome(request.getNome().trim());
        cliente.setEmail(email);
        cliente.setTelefone(request.getTelefone());
        cliente.setDataNascimento(request.getDataNascimento());
        cliente.setSenhaHash(passwordEncoder.encode(request.getSenha()));

        repository.save(cliente);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                    "mensagem", "Cadastro realizado com sucesso.",
                    "id", cliente.getId()
                ));
    }

    // =========================
    // LOGIN
    // =========================

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        if (request.getEmail() == null || request.getEmail().isBlank()
                || request.getSenha() == null || request.getSenha().isBlank()) {

            return ResponseEntity.badRequest()
                    .body(Map.of("mensagem", "Informe o e-mail e a senha."));
        }

        String email = request.getEmail().trim().toLowerCase();

        Optional<Cliente> resultado = repository.findByEmail(email);

        if (resultado.isEmpty()
                || !passwordEncoder.matches(
                    request.getSenha(),
                    resultado.get().getSenhaHash())) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("mensagem", "E-mail ou senha incorretos."));
        }

        Cliente cliente = resultado.get();

        Map<String, Object> resposta = new LinkedHashMap<>();

        resposta.put("mensagem", "Login realizado com sucesso.");
        resposta.put("id", cliente.getId());
        resposta.put("nome", cliente.getNome());
        resposta.put("email", cliente.getEmail());
        resposta.put("telefone", cliente.getTelefone());
        resposta.put("dataNascimento", cliente.getDataNascimento());

        return ResponseEntity.ok(resposta);
    }

    // =========================
    // BUSCAR DADOS DO PERFIL
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPerfil(@PathVariable Long id) {

        Optional<Cliente> resultado = repository.findById(id);

        if (resultado.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensagem", "Cliente não encontrado."));
        }

        Cliente cliente = resultado.get();

        Map<String, Object> perfil = new LinkedHashMap<>();

        perfil.put("id", cliente.getId());
        perfil.put("nome", cliente.getNome());
        perfil.put("email", cliente.getEmail());
        perfil.put("telefone", cliente.getTelefone());
        perfil.put("dataNascimento", cliente.getDataNascimento());

        return ResponseEntity.ok(perfil);
    }

    // =========================
    // ATUALIZAR DADOS DO PERFIL
    // =========================

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarPerfil(
            @PathVariable Long id,
            @RequestBody Map<String, String> dados) {

        Optional<Cliente> resultado = repository.findById(id);

        if (resultado.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensagem", "Cliente não encontrado."));
        }

        String nome = dados.get("nome");
        String email = dados.get("email");
        String telefone = dados.get("telefone");
        String nascimento = dados.get("dataNascimento");

        if (nome == null || nome.isBlank()
                || email == null || email.isBlank()) {

            return ResponseEntity.badRequest()
                    .body(Map.of("mensagem", "Nome e e-mail são obrigatórios."));
        }

        email = email.trim().toLowerCase();

        if (repository.existsByEmailAndIdNot(email, id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("mensagem", "Este e-mail já está sendo utilizado."));
        }

        Cliente cliente = resultado.get();

        cliente.setNome(nome.trim());
        cliente.setEmail(email);
        cliente.setTelefone(telefone);

        try {
            if (nascimento == null || nascimento.isBlank()) {
                cliente.setDataNascimento(null);
            } else {
                cliente.setDataNascimento(LocalDate.parse(nascimento));
            }
        } catch (DateTimeParseException erro) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensagem", "Data de nascimento inválida."));
        }

        repository.save(cliente);

        Map<String, Object> resposta = new LinkedHashMap<>();

        resposta.put("mensagem", "Perfil atualizado com sucesso.");
        resposta.put("id", cliente.getId());
        resposta.put("nome", cliente.getNome());
        resposta.put("email", cliente.getEmail());
        resposta.put("telefone", cliente.getTelefone());
        resposta.put("dataNascimento", cliente.getDataNascimento());

        return ResponseEntity.ok(resposta);
    }

    // =========================
    // LISTAR CLIENTES
    // =========================

    @GetMapping
    public ResponseEntity<?> listar() {

        List<Map<String, Object>> clientes = repository.findAll()
                .stream()
                .map(cliente -> {

                    Map<String, Object> dados = new LinkedHashMap<>();

                    dados.put("id", cliente.getId());
                    dados.put("nome", cliente.getNome());
                    dados.put("email", cliente.getEmail());
                    dados.put("telefone", cliente.getTelefone());
                    dados.put("dataNascimento", cliente.getDataNascimento());
                    dados.put("status", cliente.getStatus());
                    dados.put("criadoEm", cliente.getCriadoEm());

                    return dados;
                })
                .toList();

        return ResponseEntity.ok(clientes);
    }
}
