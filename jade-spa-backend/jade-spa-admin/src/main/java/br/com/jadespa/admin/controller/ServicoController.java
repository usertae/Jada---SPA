package br.com.jadespa.admin.controller;

import br.com.jadespa.admin.model.Servico;
import br.com.jadespa.admin.repository.ServicoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/servicos")
@CrossOrigin(origins = "*")
public class ServicoController {

    private final ServicoRepository repository;

    public ServicoController(ServicoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Servico> listar() {
        return repository.findAll();
    }
}